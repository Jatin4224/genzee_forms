import { authenticatedProcedure, router } from "../../trpc";
import { formFieldService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  createFieldInput,
  deleteFieldInput,
  getFieldsInput,
  updateFieldInput,
} from "@repo/services/form-field/model";
import { fieldIdOutputModel, listFieldsOutputModel } from "./model";

const TAGS = ["Form Field"];
const getPath = generatePath("/formField");

export const formFieldRouter = router({
  createField: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFieldInput)
    .output(fieldIdOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formFieldService.createField(input);

      return {
        id,
      };
    }),

  getFields: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFields"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getFieldsInput)
    .output(listFieldsOutputModel)
    .query(async ({ input }) => {
      const fields = await formFieldService.getFields(input);

      return fields;
    }),

  updateField: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/updateField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(updateFieldInput)
    .output(fieldIdOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formFieldService.updateField(input);

      return {
        id,
      };
    }),

  deleteField: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/deleteField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(deleteFieldInput)
    .output(fieldIdOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formFieldService.deleteField(input);

      return {
        id,
      };
    }),
});
