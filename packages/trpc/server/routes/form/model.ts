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
