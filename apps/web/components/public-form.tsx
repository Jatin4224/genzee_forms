"use client";

import { Controller, useForm } from "react-hook-form";

import { useGetForm } from "~/hooks/api/form";
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

  const { register, control, handleSubmit } = useForm<Record<string, unknown>>();

  const onSubmit = (values: Record<string, unknown>) => {
    //no submission endpoint yet, so just log the collected answers keyed by labelKey
    console.log("form answers", values);
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

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
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

            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
