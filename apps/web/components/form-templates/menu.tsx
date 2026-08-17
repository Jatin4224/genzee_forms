"use client";

import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as a tasting menu. Each question is a course, numbered in roman and set
 * on cream card stock with gold rules. Like the other document styles it shows
 * every question at once - a menu is read before anything is ordered.
 *
 * Hard-coded ink-on-cream colours, so the card looks the same in either theme.
 */

const CARD = "#fbf7ef";
const INK = "#26211b";
const GOLD = "#a98545";
const MUTED = "#8a8071";
const ERROR = "#9b3025";

const ROMAN_TABLE = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
] as const;

//courses are numbered in roman, the way a set menu lists them
function toRoman(value: number) {
  let remaining = value;
  let result = "";

  for (const [amount, numeral] of ROMAN_TABLE) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }

  return result || "I";
}

//the printer's ornament a menu breaks its sections with
function Ornament() {
  return (
    <div aria-hidden className="flex items-center justify-center gap-4">
      <span className="h-px w-14" style={{ backgroundColor: GOLD, opacity: 0.5 }} />
      <span className="text-sm" style={{ color: GOLD }}>
        ❦
      </span>
      <span className="h-px w-14" style={{ backgroundColor: GOLD, opacity: 0.5 }} />
    </div>
  );
}

//the leader dots that run from a course to where its price would sit
function Leaders() {
  return (
    <span
      aria-hidden
      className="h-px min-w-6 flex-1 self-end pb-1.5"
      style={{
        backgroundImage: `repeating-linear-gradient(to right, ${MUTED} 0 1.5px, transparent 1.5px 6px)`,
        backgroundPosition: "0 100%",
        backgroundRepeat: "repeat-x",
        backgroundSize: "6px 1px",
      }}
    />
  );
}

//what the guest writes against a course. text-like types are written on the rule,
//yes/no is chosen between the two ways a course can be taken
function Order({
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
        //null, not false: false is a real answer, so it cannot double as
        //"not answered yet" - see getFieldRules
        defaultValue={null}
        rules={getFieldRules(field)}
        render={({ field: controlled }) => (
          <div className="flex items-center gap-5">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((option) => {
              const selected = controlled.value === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => controlled.onChange(option.value)}
                  aria-pressed={selected}
                  className={cn(
                    "font-heading flex items-center gap-2 text-xl transition-opacity",
                    selected ? "opacity-100" : "opacity-45 hover:opacity-75",
                  )}
                  style={{ color: INK }}
                >
                  <span aria-hidden style={{ color: selected ? GOLD : "transparent" }}>
                    ✦
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
    <input
      {...register(field.labelKey, getFieldRules(field))}
      id={field.id}
      type={getInputType(field)}
      placeholder={field.placeholder ?? ""}
      autoComplete="off"
      aria-invalid={invalid}
      //written on the rule itself, in the same serif the courses are set in
      className="font-heading w-full border-b bg-transparent pb-1.5 text-2xl italic outline-none placeholder:font-sans placeholder:text-sm placeholder:not-italic placeholder:opacity-45"
      style={{ color: INK, borderColor: invalid ? ERROR : "rgba(38,33,27,0.22)" }}
    />
  );
}

//the card the menu is printed on, with a gold rule set in from its edge
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#231e19] px-4 py-10 sm:py-16">
      <div
        className="h-fit w-full max-w-2xl px-6 py-10 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.6)] sm:px-14 sm:py-14"
        style={{ backgroundColor: CARD, color: INK }}
      >
        {/* the inset rule a printed menu carries just inside its trim */}
        <div
          className="px-4 py-8 sm:px-8 sm:py-10"
          style={{ border: `1px solid ${GOLD}`, borderWidth: "1px" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function MenuTemplate({
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
      <Card>
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <Ornament />
          <p className="font-heading text-5xl">Merci.</p>
          <p className="max-w-sm text-sm" style={{ color: MUTED }}>
            Your response has been recorded.
          </p>
          <Ornament />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <header className="flex flex-col items-center gap-4 text-center">
        <Ornament />
        <h1 className="font-heading text-4xl leading-tight wrap-break-word sm:text-5xl">
          {form.title}
        </h1>
        {form.description && (
          <p className="max-w-md text-sm leading-relaxed wrap-break-word" style={{ color: MUTED }}>
            {form.description}
          </p>
        )}
        <p
          className="text-[11px] tracking-[0.35em] uppercase"
          style={{ color: GOLD }}
        >
          {form.fields.length} course{form.fields.length === 1 ? "" : "s"}
        </p>
      </header>

      <div className="my-10">
        <Ornament />
      </div>

      {/* noValidate for the same reason as the other templates: the browser's own
          tooltip on an `email` input blocks submit with no submit event */}
      <form onSubmit={onSubmit} noValidate>
        {form.fields.length === 0 && (
          <p className="font-heading py-6 text-center text-2xl italic" style={{ color: MUTED }}>
            Nothing is being served yet.
          </p>
        )}

        <ol className="flex flex-col gap-9">
          {form.fields.map((field, index) => {
            const errorMessage = errors[field.labelKey]?.message as string | undefined;
            const { helperText } = parseFieldDescription(field.description);

            return (
              <li key={field.id} className="flex flex-col gap-3">
                {/* the course line: numeral, name, then leaders running out to
                    where a price would be */}
                <div className="flex items-end gap-3">
                  <span
                    className="font-heading shrink-0 text-sm tracking-widest"
                    style={{ color: GOLD }}
                  >
                    {toRoman(index + 1)}
                  </span>
                  <label
                    htmlFor={field.type === "YES_NO" ? undefined : field.id}
                    className="font-heading min-w-0 text-2xl leading-tight wrap-break-word"
                  >
                    {field.label}
                    {field.isRequired && <span style={{ color: GOLD }}> ✦</span>}
                  </label>
                  <Leaders />
                </div>

                {helperText && (
                  <p
                    className="text-xs leading-relaxed wrap-break-word italic"
                    style={{ color: MUTED }}
                  >
                    {helperText}
                  </p>
                )}

                <Order
                  field={field}
                  register={register}
                  control={control}
                  invalid={!!errorMessage}
                />

                {errorMessage && (
                  <p className="text-xs wrap-break-word italic" style={{ color: ERROR }}>
                    {errorMessage}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-12 flex flex-col items-center gap-6">
          <Ornament />
          <button
            type="submit"
            disabled={isSubmitting}
            className="font-heading px-10 py-3 text-xl tracking-wide transition-colors disabled:opacity-50"
            style={{ border: `1px solid ${GOLD}`, color: INK }}
          >
            {isSubmitting ? "Sending…" : "Place your order"}
          </button>
          <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: MUTED }}>
            ✦ marks a required course
          </p>
        </div>
      </form>
    </Card>
  );
}
