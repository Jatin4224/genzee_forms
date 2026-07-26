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
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

//database level enum
export const fieldTypeEnum = pgEnum("field_type_enum", [
  "TEXT",
  "NUMBER",
  "EMAIL",
  "YES_NO",
  "PASSWORD",
]);

export const formFieldsTable = pgTable(
  "forms_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    formId: uuid("form_id")
      .references(() => formsTable.id, { onDelete: "cascade" })
      .notNull(),

    label: varchar("label", { length: 255 }).notNull(),
    labelKey: varchar("label_key", { length: 100 }).notNull(),

    description: text("description"),
    placeholder: varchar("placeholder", { length: 255 }),

    isRequired: boolean("is_required").default(false).notNull(),

    index: numeric("index", { precision: 8, scale: 2 }).notNull(), //means 1.2 0.0 se lekar 0.9 tak
    type: fieldTypeEnum("type").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    unique().on(table.formId, table.index), //ek form k andar aap for same index nahi rakh skte agar mene index pr unique lagadiya to koi bhi insaan zero index par nahi bana paayga
  ],
);
