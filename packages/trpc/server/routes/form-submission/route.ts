import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { formSubmissionService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import { createSubmissionInput } from "@repo/services/form-submission/model";
import {
  listSubmissionsInputModel,
  listSubmissionsOutputModel,
  submissionIdOutputModel,
} from "./model";

const TAGS = ["Form Submission"];
const getPath = generatePath("/formSubmission");

export const formSubmissionRouter = router({
  //public: anyone with the link can submit the form
  submitForm: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/submitForm"),
        tags: TAGS,
      },
    })
    .input(createSubmissionInput)
    .output(submissionIdOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formSubmissionService.createSubmission(input);

      return {
        id,
      };
    }),

  //only the logged-in owner of the form can read its responses
  listSubmissions: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listSubmissions"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(listSubmissionsInputModel)
    .output(listSubmissionsOutputModel)
    .query(async ({ input, ctx }) => {
      const submissions = await formSubmissionService.listSubmissionsByFormId({
        formId: input.formId,
        userId: ctx.user.id,
      });

      return submissions;
    }),
});
