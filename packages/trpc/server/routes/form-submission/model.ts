import { z } from "zod";

//submitForm input is reused directly from the service model: createSubmissionInput

export const submissionIdOutputModel = z.object({
  id: z.string().describe("id of the submission"),
});

//userId is NOT taken from the client, it comes from ctx.user.id
export const listSubmissionsInputModel = z.object({
  formId: z.string().describe("uuid of the form whose submissions are being listed"),
});

export const listSubmissionsOutputModel = z.array(
  z.object({
    id: z.string().describe("id of the submission"),
    values: z
      .array(
        z.object({
          formFieldId: z.string().describe("uuid of the answered field"),
          value: z.string().describe("answer to the field"),
        }),
      )
      .nullable()
      .describe("answers to the form fields"),
    createdAt: z.date().nullable().describe("when the submission was made"),
  }),
);
