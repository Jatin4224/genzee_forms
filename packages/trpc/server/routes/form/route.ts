import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { formService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import { deleteFormInput, updateFormInput } from "@repo/services/form/model";
import {
  createFormInputModel,
  createFormOutputModel,
  dashboardStatsOutputModel,
  formIdOutputModel,
  getFormByIdInputModel,
  getFormByIdOutputModel,
  getFormMetaOutputModel,
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
      const { title, description, template, fields } = input;

      const { id } = await formService.createForm({
        title,
        description,
        template,
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

      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "This form could not be found" });
      }

      return form;
    }),

  getDashboardStats: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getDashboardStats"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(z.void())
    .output(dashboardStatsOutputModel)
    .query(async ({ ctx }) => {
      const stats = await formService.getDashboardStats(ctx.user.id);

      return stats;
    }),

  getFormMeta: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormMeta"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getFormByIdInputModel)
    .output(getFormMetaOutputModel)
    .query(async ({ input, ctx }) => {
      const form = await formService.getFormMeta({ formId: input.formId }, ctx.user.id);

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
