import { z } from "zod";
import { createFormFieldInput } from "../form-field/model";

//field schemas live in the form-field service; re-export for existing importers
export { createFormFieldInput, formFieldTypeEnum } from "../form-field/model";
export type { CreateFormFieldInputType, FormFieldType } from "../form-field/model";

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
