import { z } from "zod";

export const formSubmissionValueInput = z.object({
  formFieldId: z.string().describe("uuid of the field being answered"),
  value: z.string().describe("answer to the field, stored as a string"),
});

export type FormSubmissionValueInputType = z.infer<typeof formSubmissionValueInput>;

export const createSubmissionInput = z.object({
  formId: z.string().describe("uuid of the form being submitted"),
  values: z.array(formSubmissionValueInput).describe("answers to the form fields"),
});

export type CreateSubmissionInputType = z.infer<typeof createSubmissionInput>;

//userId is required so we can verify the requester owns the form before returning responses
export const listSubmissionsByFormIdInput = z.object({
  formId: z.string().describe("uuid of the form whose submissions are being listed"),
  userId: z.string().describe("uuid of the user requesting the submissions, must own the form"),
});

export type ListSubmissionsByFormIdInputType = z.infer<typeof listSubmissionsByFormIdInput>;
