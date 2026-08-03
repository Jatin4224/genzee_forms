"use client";

import { IconCircleCheck } from "@tabler/icons-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

import { FieldControl } from "./field-control";
import type { FormTemplateProps } from "./types";

//the page under a template is bare, so each template brings its own backdrop
function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-aurora min-h-screen w-full py-10">
      <div className="mx-auto w-full max-w-xl p-6">{children}</div>
    </div>
  );
}

//the original look: one card, every field stacked, submit at the bottom
export function ClassicTemplate({
  form,
  register,
  control,
  errors,
  isSubmitting,
  isSuccess,
  onSubmit,
}: FormTemplateProps) {
  if (isSuccess) {
    return (
      <Backdrop>
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
      </Backdrop>
    );
  }

  return (
    <Backdrop>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-normal">{form.title}</CardTitle>
          {form.description && <CardDescription>{form.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            {form.fields.map((field, i) => (
              <FieldControl
                key={field.id}
                field={field}
                register={register}
                control={control}
                errors={errors}
                autoFocus={i === 0}
                className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Backdrop>
  );
}
