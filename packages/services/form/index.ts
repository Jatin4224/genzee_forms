import { db, desc, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";

import FormFieldService from "../form-field";
import {
  type CreateFormInputType,
  type ListFormsByUserIdInputType,
  createFormInput,
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
}

export default FormService;
