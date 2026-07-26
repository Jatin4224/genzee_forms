import { z } from "zod";

//keep in sync with fieldTypeEnum in @repo/database/models/form-field
export const formFieldTypeEnum = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export type FormFieldType = z.infer<typeof formFieldTypeEnum>;

export const createFormFieldInput = z.object({
  label: z.string().describe("label of the field shown to the user"),
  labelKey: z.string().describe("unique key of the field used to read its answer"),
  description: z.string().describe("helper text of the field").optional(),
  placeholder: z.string().describe("placeholder of the field").optional(),
  isRequired: z.boolean().describe("whether the field is mandatory").default(false),
  index: z.number().describe("position of the field within the form"),
  type: formFieldTypeEnum.describe("type of the field"),
});

export type CreateFormFieldInputType = z.infer<typeof createFormFieldInput>;

export const createFormInput = z.object({
  title: z.string().describe("title of the form"),
  description: z.string().describe("description of the form").optional(),
  createdBy: z.string().describe("uuid of the user creating the form"),
  fields: z.array(createFormFieldInput).describe("fields of the form"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
  userId: z.string().describe("uuid of the user whose forms are being listed"),
});

export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;
