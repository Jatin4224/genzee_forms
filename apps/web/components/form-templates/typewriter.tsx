"use client";

import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as a sheet rolled into a typewriter. The platen sits across the top, the
 * page comes out from under it, and every question is typed onto it. Like the
 * other paper styles it shows the whole form at once.
 *
 * Hard-coded ink-on-paper colours, so the page reads the same in either theme.
 */

const PAPER = "#f6f1e3";
const INK = "#3a332c";
const INK_FAINT = "#7d766a";
//the red half of a two-colour ribbon, used for what needs attention
const RIBBON_RED = "#a8322a";

//struck type is never crisp: a hair of spread sells the impression
const STRUCK = { textShadow: "0.4px 0 0 rgba(58,51,44,0.35)" } as const;

//the rule typed under a heading. capped so a long title does not run off the page
function typedRule(length: number) {
  return "=".repeat(Math.min(Math.max(length, 8), 44));
}

//a knob on the end of the platen
function Knob() {
  return (
    <span
      aria-hidden
      className="size-9 shrink-0 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)]"
      style={{ backgroundImage: "linear-gradient(160deg,#4a4a4a,#242424)" }}
    />
  );
}

//what gets struck onto the page. text-like types are typed on the line, yes/no is
//marked between two parenthesised options the way a form would be filled in
function Struck({
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
          <div className="flex items-center gap-6 font-mono text-sm">
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
                  className="transition-opacity hover:opacity-80"
                  style={{
                    color: selected ? INK : INK_FAINT,
                    ...STRUCK,
                  }}
                >
                  ({selected ? "X" : " "}) {option.label}
                </button>
              );
            })}
            {invalid && (
              <span aria-hidden className="font-mono text-sm" style={{ color: RIBBON_RED }}>
                *
              </span>
            )}
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
      //typed straight onto the sheet: no box, just the line the carriage runs along
      className="w-full border-b bg-transparent pb-1 font-mono text-base outline-none placeholder:text-black/25"
      style={{
        color: INK,
        borderColor: invalid ? RIBBON_RED : "rgba(58,51,44,0.28)",
        caretColor: INK,
        ...STRUCK,
      }}
    />
  );
}

//the machine: platen and knobs across the top, the sheet fed out beneath it
function Typewriter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#241f1a] px-3 py-8 sm:px-6 sm:py-12">
      <div className="h-fit w-full max-w-2xl">
        {/* the platen, with a knob at each end */}
        <div className="relative z-20 flex items-center gap-2">
          <Knob />
          <div
            className="h-9 flex-1 rounded-full shadow-[0_6px_14px_rgba(0,0,0,0.55)]"
            style={{ backgroundImage: "linear-gradient(180deg,#3d3d3d,#141414 60%,#2a2a2a)" }}
          >
            {/* the paper bail resting across the roller */}
            <span
              aria-hidden
              className="mt-4 block h-px w-full"
              style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
            />
          </div>
          <Knob />
        </div>

        {/* the sheet. the inset shadow at the top is the platen's own shadow
            falling on the paper as it comes out from under the roller */}
        <div
          className="relative z-10 -mt-4 px-7 pt-10 pb-10 shadow-[0_18px_45px_-12px_rgba(0,0,0,0.6),inset_0_14px_18px_-14px_rgba(0,0,0,0.55)] sm:px-14"
          style={{ backgroundColor: PAPER, color: INK }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function TypewriterTemplate({
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
      <Typewriter>
        <div className="flex flex-col items-center gap-3 py-14 text-center font-mono">
          <p className="text-3xl tracking-widest" style={STRUCK}>
            - THE END -
          </p>
          <p className="text-sm" style={{ color: INK_FAINT, ...STRUCK }}>
            your response has been recorded
          </p>
          <p aria-hidden className="mt-2 text-xs tracking-[0.4em]" style={{ color: INK_FAINT }}>
            xxxxxxxxx
          </p>
        </div>
      </Typewriter>
    );
  }

  return (
    <Typewriter>
      <header className="font-mono">
        <h1 className="text-xl tracking-widest wrap-break-word uppercase sm:text-2xl" style={STRUCK}>
          {form.title}
        </h1>
        <p aria-hidden className="mt-1 overflow-hidden text-xl whitespace-nowrap" style={STRUCK}>
          {typedRule(form.title.length)}
        </p>
        {form.description && (
          <p
            className="mt-4 text-sm leading-relaxed wrap-break-word"
            style={{ color: INK_FAINT, ...STRUCK }}
          >
            {form.description}
          </p>
        )}
      </header>

      {/* noValidate for the same reason as the other templates: the browser's own
          tooltip on an `email` input blocks submit with no submit event */}
      <form onSubmit={onSubmit} noValidate className="mt-9">
        {form.fields.length === 0 && (
          <p className="font-mono text-sm" style={{ color: INK_FAINT, ...STRUCK }}>
            nothing typed up yet.
          </p>
        )}

        <ol className="flex flex-col gap-7">
          {form.fields.map((field, index) => {
            const errorMessage = errors[field.labelKey]?.message as string | undefined;
            const { helperText } = parseFieldDescription(field.description);

            return (
              <li key={field.id} className="flex gap-3 font-mono">
                <span className="w-7 shrink-0 text-sm" style={STRUCK}>
                  {index + 1}.
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <label
                    htmlFor={field.type === "YES_NO" ? undefined : field.id}
                    className="text-sm tracking-wide wrap-break-word uppercase"
                    style={STRUCK}
                  >
                    {field.label}
                    {field.isRequired && <span style={{ color: RIBBON_RED }}> *</span>}
                  </label>

                  {helperText && (
                    <p
                      className="text-xs leading-relaxed wrap-break-word"
                      style={{ color: INK_FAINT, ...STRUCK }}
                    >
                      {helperText}
                    </p>
                  )}

                  <Struck
                    field={field}
                    register={register}
                    control={control}
                    invalid={!!errorMessage}
                  />

                  {errorMessage && (
                    <p
                      className="text-xs wrap-break-word"
                      style={{ color: RIBBON_RED, ...STRUCK }}
                    >
                      {errorMessage}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            //shaped like a key on the keyboard below
            className={cn(
              "rounded-md border-2 px-8 py-3 font-mono text-sm tracking-[0.25em] uppercase transition-colors disabled:opacity-50",
              "hover:bg-black/5",
            )}
            style={{ borderColor: INK, color: INK, ...STRUCK }}
          >
            {isSubmitting ? "Typing…" : "Return ⏎"}
          </button>
          <p className="font-mono text-[11px]" style={{ color: INK_FAINT }}>
            * marks a required line
          </p>
        </div>
      </form>
    </Typewriter>
  );
}
