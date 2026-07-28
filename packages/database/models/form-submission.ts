import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  numeric,
  pgEnum,
  text,
  unique,
  json,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { formFieldsTable } from "./form-field";

export interface FormSubmissionValue {
  //ek submission value kese dikhegi
  formFieldId: string;
  value: string;
}

export type FormSubmissionValueRow = FormSubmissionValue[];

export const formSubmissionTable = pgTable("forms_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id").references(() => formsTable.id),

  values: json("values").$type<FormSubmissionValueRow>(), //infer karre h .$type<FormSubmissionValueRow>(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
