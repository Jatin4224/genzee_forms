import { z } from "zod";
import { createFormFieldInput, formFieldTypeEnum } from "@repo/services/form-field/model";

//createdBy is NOT taken from the client, it comes from ctx.user.id
export const getFormByIdInputModel = z.object({
  formId: z.string().describe("uuid of the form being fetched"),
});

export const getFormByIdOutputModel = z.object({
  id: z.string().describe("id of the form"),
  title: z.string().describe("title of the form"),
  description: z.string().nullable().describe("description of the form"),
  fields: z.array(
    z.object({
      id: z.string().describe("id of the field"),
      label: z.string().describe("label of the field"),
      labelKey: z.string().describe("stable slug of the field"),
      description: z.string().nullable().describe("helper text of the field"),
      placeholder: z.string().nullable().describe("placeholder of the field"),
      isRequired: z.boolean().describe("whether the field is mandatory"),
      index: z.string().describe("fractional position of the field (numeric stored as string)"),
      type: formFieldTypeEnum.describe("type of the field"),
    }),
  ),
});

//createdBy is NOT taken from the client, it comes from ctx.user.id
export const createFormInputModel = z.object({
  title: z.string().describe("title of the form"),
  description: z.string().describe("description of the form").optional(),
  fields: z.array(createFormFieldInput).describe("fields of the form"),
});

export const createFormOutputModel = z.object({
  id: z.string().describe("id of the form created"),
});

export const formIdOutputModel = z.object({
  id: z.string().describe("id of the form"),
});

export const getFormMetaOutputModel = z.object({
  id: z.string().describe("id of the form"),
  title: z.string().describe("title of the form"),
  description: z.string().nullable().describe("description of the form"),
  isPublished: z.boolean().describe("whether the form is publicly shareable"),
});

export const listFormsOutputModel = z.array(
  z.object({
    id: z.string().describe("id of the form"),
    title: z.string().describe("title of the form"),
    description: z.string().nullable().describe("description of the form"),
    isPublished: z.boolean().describe("whether the form is publicly shareable"),
    createdAt: z.date().nullable().describe("when the form was created"),
    updatedAt: z.date().nullable().describe("when the form was last updated"),
  }),
);
