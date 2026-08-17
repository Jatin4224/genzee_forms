"use client";

import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form written up on a slate. Questions are chalked out in a wooden-framed
 * board and answered on chalk-drawn lines, with a tray of chalk underneath. Like
 * the other board and document styles it shows every question at once.
 *
 * Hard-coded chalk-on-slate colours, so the board reads the same in either theme.
 */

const CHALK = "#f3f1e7";
const CHALK_DIM = "rgba(243,241,231,0.62)";
const CHALK_YELLOW = "#f5e6a3";
const CHALK_PINK = "#f2b8c0";

//chalk never sits flat on slate; a faint glow around the strokes reads as dust
const DUSTY = { textShadow: "0 0 1px rgba(255,255,255,0.45)" } as const;

//the slate: dark green with smudges of old chalk that never quite washed off
const SLATE = {
  backgroundColor: "#2f463d",
  backgroundImage: [
    "radial-gradient(ellipse 40% 18% at 22% 28%, rgba(255,255,255,0.055), transparent 70%)",
    "radial-gradient(ellipse 30% 22% at 74% 62%, rgba(255,255,255,0.045), transparent 70%)",
    "radial-gradient(ellipse 50% 14% at 48% 86%, rgba(255,255,255,0.035), transparent 70%)",
  ].join(","),
} as const;

//the frame the slate is mounted in
const WOOD = {
  backgroundImage: "linear-gradient(160deg,#7d5732,#5d3f22 45%,#8a6238)",
} as const;

//a stick of chalk in the tray
function ChalkStick({ colour, length }: { colour: string; length: string }) {
  return (
    <span
      aria-hidden
      className="h-2 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
      style={{ backgroundColor: colour, width: length }}
    />
  );
}

//the board: wooden frame, slate, and the tray along the bottom
function Board({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#1d1a16] px-3 py-8 sm:px-6 sm:py-12">
      <div className="h-fit w-full max-w-3xl">
        <div className="rounded-t-md p-3 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.75)] sm:p-4" style={WOOD}>
          <div
            className="rounded-sm px-5 py-8 shadow-[inset_0_0_60px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12"
            style={SLATE}
          >
            {children}
          </div>
        </div>

        {/* the tray, with the chalk and the eraser resting on it */}
        <div
          className="flex items-center gap-2 rounded-b-md px-5 py-2.5 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.7)] sm:px-8"
          style={WOOD}
        >
          <span
            aria-hidden
            className="h-4 w-12 rounded-[2px] bg-[#3b332c] shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          >
            {/* the felt strip along the eraser's face */}
            <span className="block h-1.5 w-full rounded-t-[2px] bg-[#584c40]" />
          </span>
          <ChalkStick colour={CHALK} length="2.5rem" />
          <ChalkStick colour={CHALK_YELLOW} length="1.75rem" />
          <ChalkStick colour={CHALK_PINK} length="2rem" />
        </div>
      </div>
    </div>
  );
}

//what gets chalked in as the answer. text-like types are written on a drawn line,
//yes/no gets boxes with a tick scrawled into the chosen one
function Chalked({
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
          <div className="flex items-center gap-6">
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
                  className="font-hand flex items-center gap-2 text-2xl transition-opacity hover:opacity-100"
                  style={{
                    color: selected ? CHALK : CHALK_DIM,
                    opacity: selected ? 1 : 0.7,
                    ...DUSTY,
                  }}
                >
                  <span
                    aria-hidden
                    className="grid size-5 place-items-center border-2 text-lg leading-none"
                    style={{ borderColor: invalid ? CHALK_PINK : CHALK_DIM }}
                  >
                    {selected ? "✓" : ""}
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
      //written straight on the slate, on a line drawn under the words
      className="font-hand w-full border-b-2 bg-transparent pb-1 text-2xl outline-none placeholder:font-sans placeholder:text-sm placeholder:text-[#f3f1e7]/25"
      style={{
        color: CHALK,
        borderColor: invalid ? CHALK_PINK : "rgba(243,241,231,0.35)",
        ...DUSTY,
      }}
    />
  );
}

export function ChalkboardTemplate({
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
      <Board>
        <div className="flex flex-col items-center gap-4 py-14 text-center">
          <p className="font-hand text-5xl" style={{ color: CHALK, ...DUSTY }}>
            Well done!
          </p>
          <p className="font-hand text-2xl" style={{ color: CHALK_DIM, ...DUSTY }}>
            Your response has been recorded.
          </p>
        </div>
      </Board>
    );
  }

  return (
    <Board>
      <header className="mb-10 text-center">
        <h1
          className="font-hand text-4xl wrap-break-word underline decoration-2 decoration-wavy underline-offset-8 sm:text-5xl"
          style={{ color: CHALK, textDecorationColor: CHALK_YELLOW, ...DUSTY }}
        >
          {form.title}
        </h1>
        {form.description && (
          <p
            className="font-hand mx-auto mt-4 max-w-xl text-2xl wrap-break-word"
            style={{ color: CHALK_DIM, ...DUSTY }}
          >
            {form.description}
          </p>
        )}
      </header>

      {/* noValidate for the same reason as the other templates: the browser's own
          tooltip on an `email` input blocks submit with no submit event */}
      <form onSubmit={onSubmit} noValidate>
        {form.fields.length === 0 && (
          <p
            className="font-hand py-6 text-center text-2xl"
            style={{ color: CHALK_DIM, ...DUSTY }}
          >
            Nothing written up yet.
          </p>
        )}

        <ol className="flex flex-col gap-8">
          {form.fields.map((field, index) => {
            const errorMessage = errors[field.labelKey]?.message as string | undefined;
            const { helperText } = parseFieldDescription(field.description);

            return (
              <li key={field.id} className="flex gap-3">
                {/* the number chalked in the margin, in a second colour */}
                <span
                  className="font-hand w-7 shrink-0 pt-1 text-2xl"
                  style={{ color: CHALK_YELLOW, ...DUSTY }}
                >
                  {index + 1}.
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <label
                    htmlFor={field.type === "YES_NO" ? undefined : field.id}
                    className="font-hand text-2xl leading-snug wrap-break-word"
                    style={{ color: CHALK, ...DUSTY }}
                  >
                    {field.label}
                    {field.isRequired && <span style={{ color: CHALK_PINK }}> *</span>}
                  </label>

                  {helperText && (
                    <p
                      className="font-hand -mt-2 text-lg leading-snug wrap-break-word"
                      style={{ color: CHALK_DIM, ...DUSTY }}
                    >
                      {helperText}
                    </p>
                  )}

                  <Chalked
                    field={field}
                    register={register}
                    control={control}
                    invalid={!!errorMessage}
                  />

                  {errorMessage && (
                    <p
                      className="font-hand text-lg wrap-break-word"
                      style={{ color: CHALK_PINK, ...DUSTY }}
                    >
                      {errorMessage}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "font-hand border-2 px-10 py-2.5 text-3xl transition-colors disabled:opacity-50",
              "hover:bg-[#f3f1e7]/10",
            )}
            style={{ color: CHALK, borderColor: CHALK_DIM, ...DUSTY }}
          >
            {isSubmitting ? "Handing in…" : "Hand it in"}
          </button>
        </div>
      </form>
    </Board>
  );
}
