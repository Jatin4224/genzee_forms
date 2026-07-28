import { and, asc, db, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";

import {
  type CreateFieldInputType,
  type CreateFormFieldInputType,
  type DeleteFieldInputType,
  type GetFieldsInputType,
  type UpdateFieldInputType,
  createFieldInput,
  deleteFieldInput,
  getFieldsInput,
  updateFieldInput,
} from "./model";

//transaction executor, so bulk creation can run inside another service's transaction
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

class FormFieldService {
  //throws unless the given form belongs to the given user
  private async assertFormOwned(formId: string, userId: string) {
    const owned = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));

    if (!owned[0]) throw new Error(`Form not found or you do not have access to it`);
  }

  //throws unless the field's parent form belongs to the given user
  private async assertFieldOwned(fieldId: string, userId: string) {
    const owned = await db
      .select({ id: formFieldsTable.id })
      .from(formFieldsTable)
      .innerJoin(formsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(and(eq(formFieldsTable.id, fieldId), eq(formsTable.createdBy, userId)));

    if (!owned[0]) throw new Error(`Field not found or you do not have access to it`);
  }

  //bulk create used when a form is created with its initial fields (runs inside a transaction)
  public async createFields(
    tx: DbTransaction,
    formId: string,
    fields: CreateFormFieldInputType[],
  ) {
    if (fields.length === 0) return;

    await tx.insert(formFieldsTable).values(
      fields.map((field) => ({
        formId,
        label: field.label,
        labelKey: field.labelKey,
        description: field.description,
        placeholder: field.placeholder,
        isRequired: field.isRequired,
        index: field.index.toString(), //numeric column is stored as a string
        type: field.type,
      })),
    );
  }

  public async createField(payload: CreateFieldInputType, userId: string) {
    const field = await createFieldInput.parseAsync(payload);

    await this.assertFormOwned(field.formId, userId);

    const result = await db
      .insert(formFieldsTable)
      .values({
        formId: field.formId,
        label: field.label,
        labelKey: field.labelKey,
        description: field.description,
        placeholder: field.placeholder,
        isRequired: field.isRequired,
        index: field.index.toString(),
        type: field.type,
      })
      .returning({
        id: formFieldsTable.id,
      });

    const createdField = result[0];
    if (!createdField) throw new Error(`something went wrong while creating a field`);

    return {
      id: createdField.id,
    };
  }

  public async getFields(payload: GetFieldsInputType) {
    const { formId } = await getFieldsInput.parseAsync(payload);

    const fields = await db
      .select({
        id: formFieldsTable.id,
        label: formFieldsTable.label,
        labelKey: formFieldsTable.labelKey,
        description: formFieldsTable.description,
        placeholder: formFieldsTable.placeholder,
        isRequired: formFieldsTable.isRequired,
        index: formFieldsTable.index,
        type: formFieldsTable.type,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.index)); //fractional index keeps fields in order

    return fields;
  }

  public async updateField(payload: UpdateFieldInputType, userId: string) {
    //labelKey is not accepted here, so it can never change once set
    const { id, index, ...rest } = await updateFieldInput.parseAsync(payload);

    await this.assertFieldOwned(id, userId);

    await db
      .update(formFieldsTable)
      .set({
        ...rest,
        ...(index !== undefined ? { index: index.toString() } : {}),
      })
      .where(eq(formFieldsTable.id, id));

    return {
      id,
    };
  }

  public async deleteField(payload: DeleteFieldInputType, userId: string) {
    const { id } = await deleteFieldInput.parseAsync(payload);

    await this.assertFieldOwned(id, userId);

    await db.delete(formFieldsTable).where(eq(formFieldsTable.id, id));

    return {
      id,
    };
  }
}

export default FormFieldService;
