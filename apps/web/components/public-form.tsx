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

export function PublicForm({ formId }: { formId: string }) {
  const { form, isLoading, error } = useGetForm(formId);
  const { submitFormAsync, isSuccess } = useSubmitForm();

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Record<string, unknown>>();

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
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
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
            {form.fields.map((field) =>
              field.type === "YES_NO" ? (
                <Controller
                  key={field.id}
                  control={control}
                  name={field.labelKey}
                  defaultValue={false}
                  rules={{ required: field.isRequired }}
                  render={({ field: controlled }) => (
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={Boolean(controlled.value)}
                        onCheckedChange={controlled.onChange}
                      />
                      {field.label}
                      {field.isRequired && <span className="text-destructive">*</span>}
                    </label>
                  )}
                />
              ) : (
                <Field key={field.id}>
                  <FieldLabel htmlFor={field.id}>
                    {field.label}
                    {field.isRequired && <span className="text-destructive"> *</span>}
                  </FieldLabel>
                  <Input
                    id={field.id}
                    type={INPUT_TYPE[field.type] ?? "text"}
                    placeholder={field.placeholder ?? ""}
                    required={field.isRequired}
                    {...register(field.labelKey, { required: field.isRequired })}
                  />
                </Field>
              ),
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
