"use client";

import { useForm } from "react-hook-form";

import { useGetForm } from "~/hooks/api/form";
import { useSubmitForm } from "~/hooks/api/form-submission";

import type { PublicFormValues } from "./types";

//all of the public form's behaviour lives here: fetching, form state, and submission.
//templates receive the result and only decide how it looks, so submit logic is written once
export function usePublicForm(formId: string) {
  const { form, isLoading, error } = useGetForm(formId);
  const { submitFormAsync, isSuccess } = useSubmitForm();

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm<PublicFormValues>({ mode: "onTouched" });

  const onSubmit = handleSubmit(async (values: PublicFormValues) => {
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
  });

  return {
    form,
    isLoading,
    error,
    isSuccess,
    register,
    control,
    errors,
    trigger,
    isSubmitting,
    onSubmit,
  };
}
