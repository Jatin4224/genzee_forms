CREATE TYPE "public"."field_type_enum" AS ENUM('TEXT', 'NUMBER', 'EMAIL', 'YES_NO', 'PASSWORD');--> statement-breakpoint
CREATE TABLE "forms_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"label" varchar(255) NOT NULL,
	"label_key" varchar(100) NOT NULL,
	"description" text,
	"placeholder" varchar(255),
	"is_required" boolean DEFAULT false NOT NULL,
	"index" numeric(8, 2) NOT NULL,
	"type" "field_type_enum" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "forms_fields_form_id_index_unique" UNIQUE("form_id","index")
);
--> statement-breakpoint
ALTER TABLE "forms_fields" ADD CONSTRAINT "forms_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;