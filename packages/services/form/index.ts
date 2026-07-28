import { asc, db, desc, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";

import FormFieldService from "../form-field";
import {
  type CreateFormInputType,
  type GetFormByIdInputType,
  type ListFormsByUserIdInputType,
  createFormInput,
  getFormByIdInput,
  listFormsByUserIdInput,
} from "./model";

class FormService {
  private formFieldService = new FormFieldService();

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

    //field is null on the single row a fields-less form produces, so filter those out
    const fields = rows
      .map((row) => row.field)
      .filter((field): field is NonNullable<typeof field> => field !== null);

    return {
      ...firstRow.form,
      fields,
    };
  }
}

export default FormService;
