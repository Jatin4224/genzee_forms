import { pgTable, uuid, varchar, timestamp, boolean, text } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

//the visual styles a form can be rendered with. single source of truth:
//zod's formTemplateEnum derives from this, and so does the FORM_TEMPLATES registry
//in apps/web/components/form-templates (via the trpc output type).
//stored as a varchar and not a pgEnum on purpose - adding a style is a code-only
//change and must not need a migration.
export const FORM_TEMPLATE_NAMES = ["CLASSIC", "CONVERSATION"] as const;

export type FormTemplateName = (typeof FORM_TEMPLATE_NAMES)[number];

export const DEFAULT_FORM_TEMPLATE: FormTemplateName = "CLASSIC";

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: varchar("title", { length: 55 }).notNull(), //notNull - compulsary
  description: varchar("description", { length: 300 }),

  //only published forms can be fetched through the public getForm procedure
  isPublished: boolean("is_published").default(false).notNull(),

  //visual style the public form renders with - see FORM_TEMPLATE_NAMES above
  template: varchar("template", { length: 40 })
    .$type<FormTemplateName>()
    .default(DEFAULT_FORM_TEMPLATE)
    .notNull(),

  createdBy: uuid("created_by").references(() => usersTable.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
