import { z } from "zod";
import { createFormFieldInput } from "@repo/services/form/model";

//createdBy is NOT taken from the client, it comes from ctx.user.id
export const createFormInputModel = z.object({
  title: z.string().describe("title of the form"),
  description: z.string().describe("description of the form").optional(),
  fields: z.array(createFormFieldInput).describe("fields of the form"),
});

export const createFormOutputModel = z.object({
  id: z.string().describe("id of the form created"),
});

export const listFormsOutputModel = z.array(
  z.object({
    id: z.string().describe("id of the form"),
    title: z.string().describe("title of the form"),
    description: z.string().nullable().describe("description of the form"),
    createdAt: z.date().nullable().describe("when the form was created"),
    updatedAt: z.date().nullable().describe("when the form was last updated"),
  }),
);
