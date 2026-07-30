"use client";

import { Controller, useForm } from "react-hook-form";
import { IconCircleCheck } from "@tabler/icons-react";

import { useGetForm } from "~/hooks/api/form";
import { useSubmitForm } from "~/hooks/api/form-submission";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";

//map a field type to the html input type for the text-like inputs
const INPUT_TYPE: Record<string, string> = {
  TEXT: "text",
  NUMBER: "number",
  EMAIL: "email",
  PASSWORD: "password",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PublicForm({ formId }: { formId: string }) {
  const { form, isLoading, error } = useGetForm(formId);
  const { submitFormAsync, isSuccess } = useSubmitForm();

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<Record<string, unknown>>({ mode: "onTouched" });

  const onSubmit = async (values: Record<string, unknown>) => {
    if (!form) return;

    //the form collects answers keyed by labelKey; the submission stores them keyed by field id
    const submissionValues = form.fields.map((field) => {
      const answer = values[field.labelKey];
      return {
        formFieldId: field.id,
        value: answer === undefined || answer === null ? "" : String(answer),
      };
    });

    await submitFormAsync({ formId, values: submissionValues });
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-xl p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center text-muted-foreground">
        This form could not be found.
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/12 text-primary">
              <IconCircleCheck className="size-9" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl">Thank you!</h2>
              <p className="text-muted-foreground">Your response has been recorded.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-normal">{form.title}</CardTitle>
          {form.description && <CardDescription>{form.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {form.fields.map((field, i) => {
              const errorMessage = errors[field.labelKey]?.message as string | undefined;
              return field.type === "YES_NO" ? (
                <Controller
                  key={field.id}
                  control={control}
                  name={field.labelKey}
                  defaultValue={false}
                  rules={{ required: field.isRequired ? "This field is required" : false }}
                  render={({ field: controlled }) => (
                    <div
                      className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both flex flex-col gap-1"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={Boolean(controlled.value)}
                          onCheckedChange={controlled.onChange}
                          aria-invalid={!!errorMessage}
                        />
                        {field.label}
                        {field.isRequired && <span className="text-destructive"> *</span>}
                      </label>
                      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                    </div>
                  )}
                />
              ) : (
                <Field
                  key={field.id}
                  className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <FieldLabel htmlFor={field.id}>
                    {field.label}
                    {field.isRequired && <span className="text-destructive"> *</span>}
                  </FieldLabel>
                  <Input
                    id={field.id}
                    type={INPUT_TYPE[field.type] ?? "text"}
                    placeholder={field.placeholder ?? ""}
                    autoFocus={i === 0}
                    aria-invalid={!!errorMessage}
                    {...register(field.labelKey, {
                      required: field.isRequired ? "This field is required" : false,
                      ...(field.type === "EMAIL"
                        ? { pattern: { value: EMAIL_PATTERN, message: "Enter a valid email" } }
                        : {}),
                    })}
                  />
                  {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                </Field>
              );
            })}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
