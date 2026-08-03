"use client";

import { useState } from "react";
import Image from "next/image";
import { Controller } from "react-hook-form";
import { IconArrowLeft, IconCircleCheck, IconCornerDownLeft } from "@tabler/icons-react";

import { cn } from "~/lib/utils";

import {
  CHARACTER_IMAGES,
  CHARACTER_NAME,
  parseFieldDescription,
  type CharacterExpression,
} from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

//the dark stage the whole template sits on. hard-coded colours on purpose: this
//template is always dark, whichever theme the rest of the page is rendered in
function Scene({
  expression,
  children,
  progress,
}: {
  expression: CharacterExpression;
  children: React.ReactNode;
  //0-1, drives the bar across the top. omitted on the thank-you screen
  progress?: number;
}) {
  return (
    <div className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#0a0b0d] text-white">
      {/* cool light from above, warm light from behind the character */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-2/3 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(78,110,150,0.28),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[5%] -bottom-[22%] -z-10 h-[80vh] w-[65vw] rounded-full bg-[radial-gradient(circle,rgba(255,132,64,0.32),transparent_62%)] blur-3xl"
      />

      {progress !== undefined && (
        <div aria-hidden className="absolute inset-x-0 top-0 z-20 h-[3px] bg-white/6">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}

      {/* flex-1 rather than another min-h, so the scene is exactly one viewport tall */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-8 px-6 py-14 md:flex-row md:items-center md:gap-6 md:px-10">
        {/* min-w-0 lets a long question wrap instead of stretching the column */}
        <div className="w-full max-w-xl min-w-0 md:flex-1">{children}</div>

        {/* the character shares the container rather than hugging the viewport edge,
            so it stays beside the card instead of drifting off on a wide screen */}
        <div className="pointer-events-none flex shrink-0 justify-center self-center md:-mb-14 md:w-[38%] md:self-end">
          <Image
            src={CHARACTER_IMAGES[expression]}
            alt=""
            aria-hidden
            priority
            className="h-auto w-40 max-w-full object-contain object-bottom opacity-60 select-none md:max-h-[72svh] md:w-full md:opacity-100"
          />
        </div>
      </div>
    </div>
  );
}

//shared shell for the question card - the diamond points at the character
function QuestionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl border border-white/8 bg-[#141519]/75 px-6 py-6 backdrop-blur-md md:px-8 md:py-8">
      {children}
      <span
        aria-hidden
        className="absolute top-1/2 right-0 size-6 -translate-y-1/2 translate-x-1/2 rotate-45 rounded-[4px] border-t border-r border-white/8 bg-[#141519]"
      />
    </div>
  );
}

//the answer control for the current question. text-like types get the pill input,
//yes/no gets a pair of buttons - anything else would not read as a conversation
function Answer({
  field,
  register,
  control,
  errorMessage,
}: {
  field: PublicFormField;
  register: FormTemplateProps["register"];
  control: FormTemplateProps["control"];
  errorMessage?: string;
}) {
  const rules = getFieldRules(field);

  if (field.type === "YES_NO") {
    return (
      <Controller
        control={control}
        name={field.labelKey}
        defaultValue={false}
        rules={rules}
        render={({ field: controlled }) => (
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((option) => {
              const isSelected = Boolean(controlled.value) === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => controlled.onChange(option.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    "min-w-28 rounded-full border px-7 py-3.5 text-base transition-colors",
                    isSelected
                      ? "border-orange-500/60 bg-orange-500/15 text-white"
                      : "border-white/10 bg-white/4 text-white/70 hover:border-white/25 hover:text-white",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      />
    );
  }

  return (
    <div className="relative">
      <input
        type={getInputType(field)}
        placeholder={field.placeholder ?? "Type your response here..."}
        autoFocus
        autoComplete="off"
        aria-invalid={!!errorMessage}
        className={cn(
          "w-full rounded-full border bg-[#141519]/70 px-6 py-4 text-lg text-white backdrop-blur-md transition-colors outline-none placeholder:text-white/35",
          errorMessage
            ? "border-red-500/60 focus:border-red-400"
            : "border-white/8 focus:border-orange-500/60",
        )}
        {...register(field.labelKey, rules)}
      />
      <span
        aria-hidden
        className="absolute top-1/2 left-0 size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] border-b border-l border-white/8 bg-[#141519]"
      />
    </div>
  );
}

//one question at a time, asked by a character whose expression is set per field
export function ConversationTemplate({
  form,
  register,
  control,
  errors,
  trigger,
  isSubmitting,
  isSuccess,
  onSubmit,
}: FormTemplateProps) {
  const [step, setStep] = useState(0);

  const total = form.fields.length;
  //a step past the end can only happen if the form's fields change mid-fill
  const field = form.fields[Math.min(step, Math.max(total - 1, 0))];

  if (isSuccess || total === 0) {
    return (
      <Scene expression="HAPPY">
        <QuestionCard>
          <div className="flex flex-col gap-4">
            <IconCircleCheck className="size-10 text-orange-500" />
            <h2 className="font-sans text-3xl font-medium md:text-4xl">
              {total === 0 ? "Nothing to ask yet" : "Thank you!"}
            </h2>
            <p className="text-base text-white/55">
              {total === 0
                ? `${CHARACTER_NAME} has no questions for you right now.`
                : "Your response has been recorded."}
            </p>
          </div>
        </QuestionCard>
      </Scene>
    );
  }

  if (!field) return null;

  const { expression, helperText } = parseFieldDescription(field.description);
  const errorMessage = errors[field.labelKey]?.message as string | undefined;
  const isLast = step === total - 1;

  //the same handler for Enter and for the Continue button: validate what is on
  //screen, then either move to the next question or submit the whole form
  const onNext: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const isValid = await trigger(field.labelKey);
    if (!isValid) return;

    if (isLast) {
      await onSubmit(event);
      return;
    }

    setStep((current) => current + 1);
  };

  return (
    <Scene expression={expression} progress={(step + 1) / total}>
      <form onSubmit={onNext} className="flex flex-col gap-8">
        <div className="flex items-center gap-4 text-sm text-white/40">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <IconArrowLeft className="size-4" />
              Back
            </button>
          )}
          <span className="ml-auto tabular-nums">
            {step + 1} / {total}
          </span>
        </div>

        <QuestionCard>
          <p className="text-xs font-semibold tracking-[0.28em] text-orange-500 uppercase">
            {CHARACTER_NAME} asks...
          </p>
          {/* scales down rather than growing the card, and wraps mid-word if a single
              token is too long to fit - a long question must not break the layout */}
          <h2 className="mt-4 font-sans text-2xl leading-tight font-medium text-balance wrap-break-word hyphens-auto sm:text-3xl lg:text-4xl">
            {field.label}
            {field.isRequired && <span className="text-orange-500"> *</span>}
          </h2>
          {helperText && (
            <p className="mt-3 text-base wrap-break-word text-white/50">{helperText}</p>
          )}
        </QuestionCard>

        {/* keyed on the field so the input remounts and re-focuses each question */}
        <div key={field.id} className="flex flex-col gap-2">
          <Answer field={field} register={register} control={control} errorMessage={errorMessage} />
          {errorMessage && <p className="px-4 text-sm text-red-400">{errorMessage}</p>}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-sm text-white/40">
            Press
            <kbd className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/6 px-2 py-1 font-sans text-xs text-white/70">
              Enter
              <IconCornerDownLeft className="size-3" />
            </kbd>
          </span>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full border border-white/10 bg-white/7 px-8 py-3.5 text-base text-white/85 transition-colors hover:bg-white/14 hover:text-white disabled:opacity-50"
          >
            {isLast ? (isSubmitting ? "Submitting..." : "Submit") : "Continue"}
          </button>
        </div>
      </form>
    </Scene>
  );
}
