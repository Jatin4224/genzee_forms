"use client";

import { useForm } from "react-hook-form";

import { cn } from "~/lib/utils";

import { DEMO_FORM } from "./demo-form";
import type { FormTemplateEntry, PublicFormData, PublicFormValues } from "./types";

const DEFAULT_PREVIEW_SCALE = 0.75;

interface TemplatePreviewProps {
  template: FormTemplateEntry;
  form?: PublicFormData;
  //css scale applied to the rendered form so a full-width layout fits in a card.
  //defaults to the template's own previewScale, since a full-viewport layout needs
  //to shrink further than a compact card
  scale?: number;
  className?: string;
}

//renders a template against demo data. throwaway form state, no data fetching and
//no submit - .light-scope makes it match the real public form even in dark mode
export function TemplatePreview({
  template,
  form = DEMO_FORM,
  scale,
  className,
}: TemplatePreviewProps) {
  const {
    register,
    control,
    trigger,
    formState: { errors },
  } = useForm<PublicFormValues>();

  const { Renderer } = template;
  const previewScale = scale ?? template.previewScale ?? DEFAULT_PREVIEW_SCALE;

  return (
    <div
      className={cn(
        "light-scope bg-background pointer-events-none relative overflow-hidden select-none",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="origin-top"
        style={{ transform: `scale(${previewScale})`, width: `${100 / previewScale}%` }}
      >
        <Renderer
          form={form}
          register={register}
          control={control}
          errors={errors}
          trigger={trigger}
          isSubmitting={false}
          isSuccess={false}
          onSubmit={(event) => event.preventDefault()}
        />
      </div>
    </div>
  );
}
