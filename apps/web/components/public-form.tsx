"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { getFormTemplate, usePublicForm } from "~/components/form-templates";

//the page itself is bare so a template can paint the whole viewport; the states this
//dispatcher owns bring their own background
function Backdrop({ children }: { children: React.ReactNode }) {
  return <div className="bg-aurora min-h-screen py-10">{children}</div>;
}

//dispatcher: owns the loading and not-found states, then hands the wired-up form
//state to whichever template the owner picked. the templates live in
//~/components/form-templates - adding one there needs no change here
export function PublicForm({ formId }: { formId: string }) {
  const { form, isLoading, error, ...state } = usePublicForm(formId);

  if (isLoading) {
    return (
      <Backdrop>
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
      </Backdrop>
    );
  }

  if (error || !form) {
    return (
      <Backdrop>
        <div className="mx-auto max-w-xl p-6 text-center text-muted-foreground">
          This form could not be found.
        </div>
      </Backdrop>
    );
  }

  const { Renderer } = getFormTemplate(form.template);

  return <Renderer form={form} {...state} />;
}
