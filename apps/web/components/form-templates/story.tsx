"use client";

import { useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { IconCheck, IconChevronLeft, IconChevronRight, IconCircleCheck, IconX } from "@tabler/icons-react";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form rendered as a sequence of full-screen stories. One question fills the
 * viewport, segmented bars across the top track progress, and tapping the right
 * edge advances while the left edge goes back.
 *
 * Colours are hard-coded like the Conversation and Chat templates: this style is
 * always dark, whichever theme the rest of the app is in.
 */

//a bold backdrop per story, cycled by question index so consecutive questions
//never share one. saturated on purpose - the whole style is the colour
const STORY_GRADIENTS = [
  "linear-gradient(160deg,#3b1578 0%,#a21caf 52%,#f0653a 100%)",
  "linear-gradient(160deg,#0b3a6f 0%,#1d7fa8 50%,#37d1a5 100%)",
  "linear-gradient(160deg,#5b1046 0%,#c02a5c 50%,#f7a13c 100%)",
  "linear-gradient(160deg,#111c46 0%,#4338ca 52%,#8b5cf6 100%)",
  "linear-gradient(160deg,#0d3f34 0%,#127f5c 50%,#b6d94c 100%)",
] as const;

const SUCCESS_GRADIENT = "linear-gradient(160deg,#0d3f34 0%,#127f5c 50%,#b6d94c 100%)";

function gradientFor(index: number) {
  return STORY_GRADIENTS[index % STORY_GRADIENTS.length]!;
}

//the ring stands in for the form owner, so it is built from the form's own title
function getInitials(title: string) {
  const initials = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("");

  return initials.toUpperCase() || "F";
}

//the stage every screen sits on, including the thank-you and the empty state
function Stage({ background, children }: { background: string; children: React.ReactNode }) {
  return (
    <div
      className="relative isolate flex h-svh w-full flex-col overflow-hidden text-white"
      style={{ backgroundImage: background }}
    >
      {/* a soft vignette so white text stays readable wherever the gradient is lightest */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent,rgba(0,0,0,0.45))]"
      />
      {children}
    </div>
  );
}

//instagram-style segments: watched ones are solid, the current one glows,
//the rest are still to come
function ProgressBars({ total, step }: { total: number; step: number }) {
  return (
    <div aria-hidden className="flex shrink-0 items-center gap-1 px-3 pt-3 sm:px-4">
      {Array.from({ length: total }).map((_, index) => (
        <span key={index} className="h-0.75 min-w-0 flex-1 overflow-hidden rounded-full bg-white/25">
          <span
            className={cn(
              "block h-full rounded-full bg-white transition-[width] duration-500 ease-out",
              index === step && "shadow-[0_0_10px_rgba(255,255,255,0.9)]",
            )}
            style={{ width: index <= step ? "100%" : "0%" }}
          />
        </span>
      ))}
    </div>
  );
}

function StoryHeader({ title, step, total }: { title: string; step: number; total: number }) {
  return (
    <header className="relative z-20 flex shrink-0 items-center gap-3 px-4 py-3 sm:px-5">
      {/* the gradient ring is the story-avatar cue, so it reads as a story straight away */}
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-tr from-amber-300 via-pink-500 to-purple-600 p-0.5">
        <span className="grid size-full place-items-center rounded-full bg-black/35 text-[11px] font-semibold backdrop-blur-sm">
          {getInitials(title)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
      </div>

      <span className="shrink-0 text-xs text-white/70 tabular-nums">
        {step + 1} / {total}
      </span>

      {/* there is nowhere for a close button to go on a public form, so it is decoration */}
      <IconX aria-hidden className="size-5 shrink-0 text-white/70" />
    </header>
  );
}

//the answer control for the current story. text-like types get the big underlined
//input, yes/no gets a pair of tap cards - a checkbox would read as a normal form
function Answer({
  field,
  register,
  control,
  autoFocus,
  onAnswered,
}: {
  field: PublicFormField;
  register: FormTemplateProps["register"];
  control: FormTemplateProps["control"];
  autoFocus: boolean;
  //a tap card answers and advances in one gesture, the way a story is meant to move
  onAnswered: () => void;
}) {
  if (field.type === "YES_NO") {
    return (
      <Controller
        control={control}
        name={field.labelKey}
        //null, not false: false is a real answer ("No"), so it cannot double as
        //"not answered yet" - see getFieldRules
        defaultValue={null}
        rules={getFieldRules(field)}
        render={({ field: controlled }) => (
          <div className="flex items-center gap-3">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  controlled.onChange(option.value);
                  //react-hook-form updates its own store synchronously, so the
                  //validation that runs on submit already sees this answer
                  onAnswered();
                }}
                className={cn(
                  "flex-1 rounded-2xl border px-6 py-5 text-lg font-medium backdrop-blur-sm transition-colors",
                  controlled.value === option.value
                    ? "border-white bg-white text-black"
                    : "border-white/30 bg-white/10 text-white hover:bg-white/20",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      />
    );
  }

  return (
    <input
      {...register(field.labelKey, getFieldRules(field))}
      type={getInputType(field)}
      placeholder={field.placeholder ?? "Type your answer"}
      autoFocus={autoFocus}
      autoComplete="off"
      aria-label={field.label}
      className="w-full border-b-2 border-white/40 bg-transparent pb-3 text-2xl text-white caret-white transition-colors outline-none placeholder:text-white/45 focus:border-white sm:text-3xl"
    />
  );
}

export function StoryTemplate({
  form,
  register,
  control,
  errors,
  trigger,
  isSubmitting,
  isSuccess,
  onSubmit,
  isPreview,
}: FormTemplateProps) {
  const total = form.fields.length;

  //the preview opens partway in so the progress bars show something to have watched
  const [step, setStep] = useState(() => (isPreview ? Math.min(1, Math.max(total - 1, 0)) : 0));

  //quick replies send through the form's own submit, so there is one advance path
  const formRef = useRef<HTMLFormElement>(null);

  //a step past the end can only happen if the form's fields change mid-fill
  const field = form.fields[Math.min(step, Math.max(total - 1, 0))];

  if (isSuccess || total === 0) {
    return (
      <Stage background={SUCCESS_GRADIENT}>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <IconCircleCheck className="size-16" />
          <h2 className="text-4xl font-medium text-balance sm:text-5xl">
            {total === 0 ? "Nothing to ask yet" : "Thank you!"}
          </h2>
          <p className="max-w-sm text-lg text-white/75">
            {total === 0
              ? "This form has no questions right now."
              : "Your response has been recorded."}
          </p>
        </div>
      </Stage>
    );
  }

  if (!field) return null;

  const { helperText } = parseFieldDescription(field.description);
  const errorMessage = errors[field.labelKey]?.message as string | undefined;
  const isLast = step === total - 1;

  const goBack = () => setStep((current) => Math.max(current - 1, 0));

  //one handler for Enter, the Continue button, the right tap zone and the tap cards:
  //validate what is on screen, then advance or submit the whole form
  const onNext: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (isPreview) return;

    const isValid = await trigger(field.labelKey);
    if (!isValid) return;

    if (isLast) {
      try {
        await onSubmit(event);
      } catch {
        //useSubmitForm already toasts the failure; swallowing it here keeps the
        //rejection from escaping and leaves the story on the last question
      }
      return;
    }

    setStep((current) => current + 1);
  };

  return (
    <Stage background={gradientFor(step)}>
      <ProgressBars total={total} step={step} />
      <StoryHeader title={form.title} step={step} total={total} />

      <form
        ref={formRef}
        onSubmit={onNext}
        //an `email` input would otherwise be rejected by the browser's own tooltip
        //with no submit event, stranding the story. react-hook-form owns validation
        noValidate
        className="relative flex min-h-0 flex-1 flex-col"
      >
        {/* tap zones sit behind the content, so tapping the input or a button never
            advances the story by accident */}
        <button
          type="button"
          aria-label="Previous question"
          disabled={step === 0}
          onClick={goBack}
          className="absolute inset-y-0 left-0 z-0 w-1/5 cursor-default disabled:pointer-events-none"
        />
        <button
          type="submit"
          aria-label={isLast ? "Submit" : "Next question"}
          className="absolute inset-y-0 right-0 z-0 w-1/5 cursor-default"
        />

        <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-6 py-6 sm:px-10">
          {/* the wrapper is click-through so the tap zones stay reachable; the card
              itself takes its clicks back */}
          <div className="pointer-events-auto mx-auto flex w-full max-w-xl flex-col gap-8">
            <div className="flex flex-col gap-3">
              {/* scales down rather than overflowing, and wraps mid-word so one long
                  token cannot break the layout */}
              <h2 className="text-3xl leading-tight font-semibold text-balance wrap-break-word hyphens-auto sm:text-4xl lg:text-5xl">
                {field.label}
                {field.isRequired && <span className="text-white/70"> *</span>}
              </h2>
              {helperText && <p className="text-lg wrap-break-word text-white/70">{helperText}</p>}
            </div>

            {/* keyed on the field so the control remounts and re-focuses each story */}
            <div key={field.id} className="flex flex-col gap-3">
              <Answer
                field={field}
                register={register}
                control={control}
                autoFocus={!isPreview}
                onAnswered={() => formRef.current?.requestSubmit()}
              />
              {errorMessage && <p className="text-sm text-red-200">{errorMessage}</p>}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex shrink-0 items-center justify-between gap-4 px-6 pb-6 sm:px-10">
          <button
            type="button"
            onClick={goBack}
            //hidden rather than removed so the footer never reflows between stories
            className={cn(
              "inline-flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white",
              step === 0 && "invisible",
            )}
          >
            <IconChevronLeft className="size-4" />
            Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLast ? (
              <>
                {isSubmitting ? "Submitting..." : "Submit"}
                <IconCheck className="size-4" />
              </>
            ) : (
              <>
                Next
                <IconChevronRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </Stage>
  );
}
