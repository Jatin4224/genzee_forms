"use client";

import { Controller, type RegisterOptions } from "react-hook-form";

import { cn } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

import type { FormTemplateProps, PublicFormField } from "./types";

//map a field type to the html input type for the text-like inputs
const INPUT_TYPE: Record<string, string> = {
  TEXT: "text",
  NUMBER: "number",
  EMAIL: "email",
  PASSWORD: "password",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//the html input type a field renders as. unknown types fall back to text
export function getInputType(field: PublicFormField) {
  return INPUT_TYPE[field.type] ?? "text";
}

//validation rules for a field. exported so a template with fully custom markup can
//still register its inputs with the same rules instead of re-deriving them
export function getFieldRules(field: PublicFormField): RegisterOptions {
  //a yes/no field cannot use `required`: react-hook-form counts a boolean false as
  //empty, so answering "No" would fail validation and there would be no way to
  //answer the question at all. unanswered is null instead - see the Controllers below
  if (field.type === "YES_NO") {
    return field.isRequired
      ? { validate: (value) => typeof value === "boolean" || "This field is required" }
      : {};
  }

  return {
    required: field.isRequired ? "This field is required" : false,
    ...(field.type === "EMAIL"
      ? { pattern: { value: EMAIL_PATTERN, message: "Enter a valid email" } }
      : {}),
  };
}

interface FieldControlProps {
  field: PublicFormField;
  register: FormTemplateProps["register"];
  control: FormTemplateProps["control"];
  errors: FormTemplateProps["errors"];
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
  //escape hatches so a template can restyle the parts without rebuilding the field
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

//renders a single field: label, control and error message.
//this is the one place that knows how a field type maps to a control, so adding a
//new field type is a change here rather than in every template
export function FieldControl({
  field,
  register,
  control,
  errors,
  autoFocus,
  className,
  style,
  labelClassName,
  inputClassName,
  errorClassName,
}: FieldControlProps) {
  const errorMessage = errors[field.labelKey]?.message as string | undefined;
  const rules = getFieldRules(field);

  if (field.type === "YES_NO") {
    return (
      <Controller
        control={control}
        name={field.labelKey}
        //null, not false: false is a real answer ("No"), so it cannot double as
        //"not answered yet" or a required yes/no could never be satisfied
        defaultValue={null}
        rules={rules}
        render={({ field: controlled }) => (
          <div className={cn("flex flex-col gap-1", className)} style={style}>
            <label className={cn("flex items-center gap-2 text-sm", labelClassName)}>
              <Checkbox
                checked={Boolean(controlled.value)}
                onCheckedChange={controlled.onChange}
                aria-invalid={!!errorMessage}
              />
              {field.label}
              {field.isRequired && <span className="text-destructive"> *</span>}
            </label>
            {errorMessage && (
              <p className={cn("text-sm text-destructive", errorClassName)}>{errorMessage}</p>
            )}
          </div>
        )}
      />
    );
  }

  return (
    <Field className={className} style={style}>
      <FieldLabel htmlFor={field.id} className={labelClassName}>
        {field.label}
        {field.isRequired && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <Input
        id={field.id}
        type={getInputType(field)}
        placeholder={field.placeholder ?? ""}
        autoFocus={autoFocus}
        aria-invalid={!!errorMessage}
        className={inputClassName}
        {...register(field.labelKey, rules)}
      />
      {errorMessage && (
        <p className={cn("text-sm text-destructive", errorClassName)}>{errorMessage}</p>
      )}
    </Field>
  );
}
