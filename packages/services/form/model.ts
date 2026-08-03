import { z } from "zod";
import { FORM_TEMPLATE_NAMES } from "@repo/database/models/form";
import { createFormFieldInput } from "../form-field/model";

//field schemas live in the form-field service; re-export for existing importers
export { createFormFieldInput, formFieldTypeEnum } from "../form-field/model";
export type { CreateFormFieldInputType, FormFieldType } from "../form-field/model";

//the visual style the public form renders with - derived from the db model so the
//list of styles lives in exactly one place
export const formTemplateEnum = z.enum(FORM_TEMPLATE_NAMES);

export type FormTemplate = z.infer<typeof formTemplateEnum>;

export const createFormInput = z.object({
  title: z.string().describe("title of the form"),
  description: z.string().describe("description of the form").optional(),
  createdBy: z.string().describe("uuid of the user creating the form"),
  //omitted falls back to the column default, so a form can still be created
  //without picking a style
  template: formTemplateEnum.describe("visual style the public form renders with").optional(),
  fields: z.array(createFormFieldInput).describe("fields of the form"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
  userId: z.string().describe("uuid of the user whose forms are being listed"),
});

export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;

export const getFormByIdInput = z.object({
  formId: z.string().describe("uuid of the form being fetched"),
});

export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>;

export const updateFormInput = z.object({
  formId: z.string().describe("uuid of the form being updated"),
  title: z.string().describe("title of the form").optional(),
  description: z.string().describe("description of the form").nullable().optional(),
  isPublished: z.boolean().describe("whether the form is publicly shareable").optional(),
  template: formTemplateEnum.describe("visual style the public form renders with").optional(),
});

export type UpdateFormInputType = z.infer<typeof updateFormInput>;

export const deleteFormInput = z.object({
  formId: z.string().describe("uuid of the form being deleted"),
});

export type DeleteFormInputType = z.infer<typeof deleteFormInput>;
