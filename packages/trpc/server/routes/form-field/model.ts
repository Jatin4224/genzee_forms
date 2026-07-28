import { z } from "zod";
import { formFieldTypeEnum } from "@repo/services/form-field/model";

//input schemas are reused directly from the service model:
//createFieldInput, updateFieldInput, deleteFieldInput, getFieldsInput

export const fieldIdOutputModel = z.object({
  id: z.string().describe("id of the field"),
});

export const listFieldsOutputModel = z.array(
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
);
