import { z } from "zod";

import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { formService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import { deleteFormInput, updateFormInput } from "@repo/services/form/model";
import {
  createFormInputModel,
  createFormOutputModel,
  formIdOutputModel,
  getFormByIdInputModel,
  getFormByIdOutputModel,
  listFormsOutputModel,
} from "./model";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
  createForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { title, description, fields } = input;

      const { id } = await formService.createForm({
        title,
        description,
        fields,
        createdBy: ctx.user.id,
      });

      return {
        id,
      };
    }),

  listForms: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listForms"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(z.void())
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
      const forms = await formService.listFormsByUserId({ userId: ctx.user.id });

      return forms;
    }),

  //public: no auth, so a form can be shared and filled by anyone with the link
  getForm: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getForm"),
        tags: TAGS,
      },
    })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ input }) => {
      const form = await formService.getFormById({ formId: input.formId });

      return form;
    }),

  updateForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/updateForm"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(updateFormInput)
    .output(formIdOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { id } = await formService.updateForm(input, ctx.user.id);

      return {
        id,
      };
    }),

  deleteForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/deleteForm"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(deleteFormInput)
    .output(formIdOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { id } = await formService.deleteForm(input, ctx.user.id);

      return {
        id,
      };
    }),
});
