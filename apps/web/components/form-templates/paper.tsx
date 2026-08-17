"use client";

import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as a printed sheet filled in by hand: the questions are typeset, the
 * answers are handwritten on ruled blanks. Unlike the other non-Classic styles
 * this one shows every question at once - a paper form you skim before filling.
 *
 * Colours are hard-coded ink-on-cream, so the sheet looks the same whatever
 * theme the rest of the app is in.
 */

const INK = "#2f3542";
const RULE = "#b9c4d6";

//the sheet itself: cream stock, a red margin rule and punched holes down the left
function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh w-full bg-[#d9d2c2] px-4 py-8 sm:px-6 sm:py-14">
      <div
        className="relative mx-auto w-full max-w-2xl rounded-[3px] bg-[#fdfaf1] px-6 py-10 shadow-[0_18px_40px_-16px_rgba(50,40,20,0.45)] sm:px-14 sm:py-14"
        style={{ color: INK }}
      >
        {/* the red margin rule, and the holes punched through it */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-8 w-px bg-[#e2857f]/70 sm:left-12"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 left-3 flex flex-col justify-center gap-24 sm:left-5"
        >
          {[0, 1, 2].map((hole) => (
            <span
              key={hole}
              className="size-3 rounded-full bg-[#d9d2c2] shadow-[inset_0_1px_2px_rgba(0,0,0,0.28)]"
            />
          ))}
        </div>

        {/* clears the margin rule so no text runs across it */}
        <div className="relative pl-6 sm:pl-8">{children}</div>
      </div>
    </div>
  );
}

//a ruled blank. the input is transparent and borderless so the rule underneath
//reads as the line being written on
function Blank({
  children,
  invalid,
}: {
  children: React.ReactNode;
  invalid?: boolean;
}) {
  return (
    <div
      className="border-b"
      style={{ borderColor: invalid ? "#c0392b" : RULE }}
    >
      {children}
    </div>
  );
}

//the answer control. text-like types are written on a ruled blank; yes/no gets
//ticked boxes, the way a paper form offers them
function Answer({
  field,
  register,
  control,
  invalid,
}: {
  field: PublicFormField;
  register: FormTemplateProps["register"];
  control: FormTemplateProps["control"];
  invalid: boolean;
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
          <div className="flex items-center gap-6 pt-1">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((option) => {
              const checked = controlled.value === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => controlled.onChange(option.value)}
                  aria-pressed={checked}
                  className="flex items-center gap-2 text-[15px]"
                >
                  {/* a hand-drawn box: the tick is written in, not a ui checkbox */}
                  <span
                    className="grid size-5 shrink-0 place-items-center border-[1.5px] font-hand text-xl leading-none"
                    style={{ borderColor: invalid ? "#c0392b" : INK }}
                  >
                    {checked ? "✓" : ""}
                  </span>
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
    <Blank invalid={invalid}>
      <input
        {...register(field.labelKey, getFieldRules(field))}
        id={field.id}
        type={getInputType(field)}
        placeholder={field.placeholder ?? ""}
        autoComplete="off"
        aria-invalid={invalid}
        //the handwriting sits slightly above the rule, the way ink does on paper
        className="font-hand w-full bg-transparent pb-1 text-2xl outline-none placeholder:font-sans placeholder:text-base placeholder:text-[#a9a396]"
        style={{ color: "#1d3f8f" }}
      />
    </Blank>
  );
}

export function PaperTemplate({
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
      <Sheet>
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          {/* a rubber stamp, rotated so it reads as pressed on by hand */}
          <div className="-rotate-12 rounded-md border-[3px] border-[#2f7a4f] px-6 py-3">
            <p className="font-hand text-4xl font-semibold text-[#2f7a4f]">Received</p>
          </div>
          <p className="text-base text-[#6b6558]">Your response has been recorded.</p>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet>
      {/* noValidate for the same reason as the other templates: the browser's own
          tooltip on an `email` input would block submit with no submit event */}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-hand text-4xl leading-tight font-semibold wrap-break-word sm:text-5xl">
            {form.title}
          </h1>
          {/* the double rule under a form's title on a printed sheet */}
          <span aria-hidden className="h-px w-full" style={{ backgroundColor: INK }} />
          <span
            aria-hidden
            className="-mt-1.5 h-px w-full"
            style={{ backgroundColor: INK, opacity: 0.35 }}
          />
          {form.description && (
            <p className="mt-2 text-[15px] wrap-break-word text-[#6b6558]">{form.description}</p>
          )}
        </header>

        {form.fields.length === 0 && (
          <p className="font-hand text-2xl text-[#6b6558]">
            This sheet has no questions on it yet.
          </p>
        )}

        <ol className="flex flex-col gap-8">
          {form.fields.map((field, index) => {
            const errorMessage = errors[field.labelKey]?.message as string | undefined;
            const { helperText } = parseFieldDescription(field.description);

            return (
              <li key={field.id} className="flex gap-3">
                {/* numbered like a question on a printed form */}
                <span className="w-6 shrink-0 pt-0.5 text-[15px] tabular-nums">{index + 1}.</span>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <label
                    htmlFor={field.type === "YES_NO" ? undefined : field.id}
                    className="text-[15px] wrap-break-word"
                  >
                    {field.label}
                    {field.isRequired && <span className="text-[#c0392b]"> *</span>}
                  </label>

                  {helperText && (
                    <p className="text-[13px] wrap-break-word text-[#6b6558] italic">
                      {helperText}
                    </p>
                  )}

                  <Answer
                    field={field}
                    register={register}
                    control={control}
                    invalid={!!errorMessage}
                  />

                  {errorMessage && (
                    <p className="text-[13px] text-[#c0392b] italic">{errorMessage}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="flex items-end justify-between gap-6 pt-2">
          {/* a signature line, the way a paper form closes */}
          <div className="hidden min-w-0 flex-1 sm:block">
            <span
              aria-hidden
              className="block h-px w-full max-w-56"
              style={{ backgroundColor: RULE }}
            />
            <span className="mt-1 block text-[13px] text-[#6b6558]">Signature</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "shrink-0 rounded-[3px] px-8 py-3 text-base text-[#fdfaf1] transition-opacity hover:opacity-90 disabled:opacity-50",
            )}
            style={{ backgroundColor: INK }}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
