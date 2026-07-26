import { db, desc, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";

import {
  type CreateFormInputType,
  type ListFormsByUserIdInputType,
  createFormInput,
  listFormsByUserIdInput,
} from "./model";

class FormService {
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

      if (fields.length > 0) {
        await tx.insert(formFieldsTable).values(
          fields.map((field) => ({
            formId: createdForm.id,
            label: field.label,
            labelKey: field.labelKey,
            description: field.description,
            placeholder: field.placeholder,
            isRequired: field.isRequired,
            index: field.index.toString(), 
            type: field.type,
          })),
        );
      }

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
}

export default FormService;
