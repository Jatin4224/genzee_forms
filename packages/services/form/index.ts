import { and, asc, db, desc, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";

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
    const { title, description, createdBy, fields } = await createFormInput.parseAsync(payload);

    //form and its fields must be created together, so wrap them in a transaction
    const formId = await db.transaction(async (tx) => {
      const formInsertResult = await tx
        .insert(formsTable)
        .values({
          title,
          description,
          createdBy,
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
    if (!firstRow) throw new Error(`Form with ID ${formId} does not exist`);

    //public endpoint: only published forms are visible
    if (!firstRow.form.isPublished) throw new Error(`Form with ID ${formId} is not available`);

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

  public async updateForm(payload: UpdateFormInputType, userId: string) {
    const { formId, ...rest } = await updateFormInput.parseAsync(payload);

    await this.assertFormOwned(formId, userId);

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
