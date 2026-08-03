import { and, asc, db, desc, eq, sql } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formSubmissionTable } from "@repo/database/models/form-submission";

import FormFieldService from "../form-field";
import {
  type CreateFormInputType,
  type DeleteFormInputType,
  type GetFormByIdInputType,
  type ListFormsByUserIdInputType,
  type UpdateFormInputType,
  createFormInput,
  deleteFormInput,
  getFormByIdInput,
  listFormsByUserIdInput,
  updateFormInput,
} from "./model";

class FormService {
  private formFieldService = new FormFieldService();

  //throws unless the given form belongs to the given user
  private async assertFormOwned(formId: string, userId: string) {
    const owned = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));

    if (!owned[0]) throw new Error(`Form not found or you do not have access to it`);
  }

  public async createForm(payload: CreateFormInputType) {
    const { title, description, createdBy, template, fields } =
      await createFormInput.parseAsync(payload);

    //form and its fields must be created together, so wrap them in a transaction
    const formId = await db.transaction(async (tx) => {
      const formInsertResult = await tx
        .insert(formsTable)
        .values({
          title,
          description,
          createdBy,
          //undefined leaves the column default in place
          ...(template ? { template } : {}),
        })
        .returning({
          id: formsTable.id,
        });

      const createdForm = formInsertResult[0];
      if (!createdForm) throw new Error(`something went wrong while creating a form`);

      //field persistence is owned by the form-field service
      await this.formFieldService.createFields(tx, createdForm.id, fields);

      return createdForm.id;
    });

    return {
      id: formId,
    };
  }

  public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
    const { userId } = await listFormsByUserIdInput.parseAsync(payload);

    const forms = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        isPublished: formsTable.isPublished,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable)
      .where(eq(formsTable.createdBy, userId))
      .orderBy(desc(formsTable.createdAt));

    return forms;
  }

  //analytics for the dashboard, scoped to the given user's forms
  public async getDashboardStats(userId: string) {
    //each form with its response count (left join so forms with 0 responses are kept)
    const formsWithCounts = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        isPublished: formsTable.isPublished,
        createdAt: formsTable.createdAt,
        responseCount: sql<number>`count(${formSubmissionTable.id})`.mapWith(Number),
      })
      .from(formsTable)
      .leftJoin(formSubmissionTable, eq(formSubmissionTable.formId, formsTable.id))
      .where(eq(formsTable.createdBy, userId))
      .groupBy(formsTable.id)
      .orderBy(desc(formsTable.createdAt));

    const totalForms = formsWithCounts.length;
    const publishedForms = formsWithCounts.filter((f) => f.isPublished).length;
    const totalResponses = formsWithCounts.reduce((sum, f) => sum + f.responseCount, 0);
    const recentForms = formsWithCounts.slice(0, 5);

    //submissions grouped by day (last 30 days) for this user's forms
    const rawByDay = await db
      .select({
        date: sql<string>`to_char(${formSubmissionTable.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(formSubmissionTable)
      .innerJoin(formsTable, eq(formSubmissionTable.formId, formsTable.id))
      .where(
        and(
          eq(formsTable.createdBy, userId),
          sql`${formSubmissionTable.createdAt} >= now() - interval '30 days'`,
        ),
      )
      .groupBy(sql`to_char(${formSubmissionTable.createdAt}, 'YYYY-MM-DD')`);

    //fill the gaps so the chart has a continuous 30-day series
    const countByDate = new Map(rawByDay.map((r) => [r.date, r.count]));
    const submissionsByDay: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      submissionsByDay.push({ date: key, count: countByDate.get(key) ?? 0 });
    }

    return {
      totalForms,
      publishedForms,
      draftForms: totalForms - publishedForms,
      totalResponses,
      recentForms,
      submissionsByDay,
    };
  }

  //public: safe to share, returns only the form's public columns and its fields.
  //a single left join fetches the form and all its fields so the form can be rendered at once
  public async getFormById(payload: GetFormByIdInputType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    const rows = await db
      .select({
        form: {
          id: formsTable.id,
          title: formsTable.title,
          description: formsTable.description,
          isPublished: formsTable.isPublished,
          template: formsTable.template,
        },
        field: {
          id: formFieldsTable.id,
          label: formFieldsTable.label,
          labelKey: formFieldsTable.labelKey,
          description: formFieldsTable.description,
          placeholder: formFieldsTable.placeholder,
          isRequired: formFieldsTable.isRequired,
          index: formFieldsTable.index,
          type: formFieldsTable.type,
        },
      })
      .from(formsTable)
      .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(eq(formsTable.id, formId))
      .orderBy(asc(formFieldsTable.index)); //fractional index keeps fields in order

    const firstRow = rows[0];

    //public endpoint: return null for a missing OR unpublished form so the route
    //can surface a clean NOT_FOUND instead of a 500.
    if (!firstRow || !firstRow.form.isPublished) return null;

    //field is null on the single row a fields-less form produces, so filter those out
    const fields = rows
      .map((row) => row.field)
      .filter((field): field is NonNullable<typeof field> => field !== null);

    const { isPublished: _isPublished, ...publicForm } = firstRow.form;

    return {
      ...publicForm,
      fields,
    };
  }

  //owner-facing: the form's metadata regardless of publish state (for the builder)
  public async getFormMeta(payload: GetFormByIdInputType, userId: string) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    await this.assertFormOwned(formId, userId);

    const rows = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        isPublished: formsTable.isPublished,
        template: formsTable.template,
      })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    const form = rows[0];
    if (!form) throw new Error(`Form not found or you do not have access to it`);

    return form;
  }

  public async updateForm(payload: UpdateFormInputType, userId: string) {
    const { formId, ...rest } = await updateFormInput.parseAsync(payload);

    await this.assertFormOwned(formId, userId);

    //zod strips keys this schema does not know about, so a client running ahead of
    //the deployed api can send a field that silently vanishes and leaves nothing to
    //update. drizzle's own error for that is "No values to set", which says nothing
    //about the cause - fail with something the caller can act on instead.
    if (Object.keys(rest).length === 0) {
      throw new Error(`No supported fields to update were provided for this form`);
    }

    await db.update(formsTable).set(rest).where(eq(formsTable.id, formId));

    return {
      id: formId,
    };
  }

  public async deleteForm(payload: DeleteFormInputType, userId: string) {
    const { formId } = await deleteFormInput.parseAsync(payload);

    await this.assertFormOwned(formId, userId);

    //form-fields cascade on delete; submissions do not, so remove the form's rows explicitly is
    //not needed here because the submissions FK has no cascade — see note in form-submission model
    await db.delete(formsTable).where(eq(formsTable.id, formId));

    return {
      id: formId,
    };
  }
}

export default FormService;
