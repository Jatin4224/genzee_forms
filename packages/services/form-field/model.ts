import { z } from "zod";

//keep in sync with fieldTypeEnum in @repo/database/models/form-field
export const formFieldTypeEnum = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export type FormFieldType = z.infer<typeof formFieldTypeEnum>;

//shape of a field WITHOUT its parent form, used when a form is created with nested fields
export const createFormFieldInput = z.object({
  label: z.string().describe("label of the field shown to the user"),
  labelKey: z.string().describe("stable slug of the field, set once and never changed"),
  description: z.string().describe("helper text of the field").optional(),
  placeholder: z.string().describe("placeholder of the field").optional(),
  isRequired: z.boolean().describe("whether the field is mandatory").default(false),
  index: z.number().describe("fractional position of the field within the form"),
  type: formFieldTypeEnum.describe("type of the field"),
});

export type CreateFormFieldInputType = z.infer<typeof createFormFieldInput>;

//create a single field under an existing form
export const createFieldInput = createFormFieldInput.extend({
  formId: z.string().describe("uuid of the form the field belongs to"),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;

//labelKey is intentionally omitted: it is set once and never changes
export const updateFieldInput = z.object({
  id: z.string().describe("uuid of the field being updated"),
  label: z.string().describe("label of the field").optional(),
  description: z.string().describe("helper text of the field").nullable().optional(),
  placeholder: z.string().describe("placeholder of the field").nullable().optional(),
  isRequired: z.boolean().describe("whether the field is mandatory").optional(),
  index: z.number().describe("fractional position of the field within the form").optional(),
  type: formFieldTypeEnum.describe("type of the field").optional(),
});

export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;

export const deleteFieldInput = z.object({
  id: z.string().describe("uuid of the field being deleted"),
});

export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;

export const getFieldsInput = z.object({
  formId: z.string().describe("uuid of the form whose fields are being listed"),
});

export type GetFieldsInputType = z.infer<typeof getFieldsInput>;
