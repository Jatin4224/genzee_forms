"use client";

import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as a till receipt. Questions are itemised down a narrow strip of thermal
 * paper, answers are printed under each line, and the totals and barcode close it
 * off. Like Classic, Paper, Comic, Spreadsheet, Corkboard and Polaroid it shows
 * every question at once.
 *
 * Hard-coded paper-on-counter colours, so it prints the same in either theme.
 */

const PAPER = "#fdfdfb";
const INK = "#2a2a2a";
const FADED = "#84847d";
const STAMP = "#b3261e";

//the torn edge of a strip pulled off the printer. the notches are transparent so
//the counter shows through them
const ZIGZAG = {
  backgroundImage: `linear-gradient(-45deg, transparent 6px, ${PAPER} 0), linear-gradient(45deg, transparent 6px, ${PAPER} 0)`,
  backgroundSize: "14px 14px",
  backgroundRepeat: "repeat-x",
} as const;

//a dotted rule, the separator a receipt uses between sections
function Rule() {
  return (
    <div
      aria-hidden
      className="my-3 h-px w-full"
      style={{
        backgroundImage: `repeating-linear-gradient(to right, ${FADED} 0 3px, transparent 3px 7px)`,
      }}
    />
  );
}

//bars derived from the form id, so a given form always prints the same barcode
//and nothing random differs between the server render and the client
function barcodeBars(seed: string) {
  const source = seed || "genzee";

  return Array.from({ length: 46 }, (_, index) => {
    const code = source.charCodeAt(index % source.length) + index * 7;
    return (code % 3) + 1;
  });
}

function Barcode({ seed }: { seed: string }) {
  return (
    <div aria-hidden className="flex h-12 items-stretch justify-center gap-px">
      {barcodeBars(seed).map((width, index) => (
        <span
          key={index}
          style={{
            width: `${width}px`,
            backgroundColor: index % 2 === 0 ? INK : "transparent",
          }}
        />
      ))}
    </div>
  );
}

//the printed answer. text-like types print on a line of their own, yes/no gets
//the ticked boxes a receipt would use for options
function Printed({
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
        //null, not false: false is a real answer (NO), so it cannot double as
        //"not answered yet" - see getFieldRules
        defaultValue={null}
        rules={getFieldRules(field)}
        render={({ field: controlled }) => (
          <div className="flex items-center gap-5 font-mono text-xs">
            {[
              { label: "YES", value: true },
              { label: "NO", value: false },
            ].map((option) => {
              const selected = controlled.value === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => controlled.onChange(option.value)}
                  aria-pressed={selected}
                  className="transition-opacity hover:opacity-70"
                  style={{ color: selected ? INK : FADED }}
                >
                  [{selected ? "X" : " "}] {option.label}
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
      //printed straight onto the strip: no box, just the line the text sits on
      className="w-full border-b bg-transparent pb-1 font-mono text-sm tracking-tight outline-none placeholder:text-black/25"
      style={{ color: INK, borderColor: invalid ? STAMP : "rgba(0,0,0,0.2)" }}
    />
  );
}

//the strip itself, torn off at both ends
function Strip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#1c1c1a] px-4 py-10 sm:py-14">
      <div className="h-fit w-full max-w-sm">
        {/* the top tear. rotated so the notches bite upward */}
        <div aria-hidden className="h-3.5 w-full rotate-180" style={ZIGZAG} />

        <div
          className="px-6 py-6 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] sm:px-8"
          style={{ backgroundColor: PAPER, color: INK }}
        >
          {children}
        </div>

        <div aria-hidden className="h-3.5 w-full" style={ZIGZAG} />
      </div>
    </div>
  );
}

export function ReceiptTemplate({
  form,
  register,
  control,
  errors,
  isSubmitting,
  isSuccess,
  onSubmit,
}: FormTemplateProps) {
  const total = form.fields.length;
  const requiredCount = form.fields.filter((field) => field.isRequired).length;

  if (isSuccess) {
    return (
      <Strip>
        <div className="flex flex-col items-center gap-4 py-6 text-center font-mono">
          <p className="text-[11px] tracking-[0.35em]" style={{ color: FADED }}>
            GENZEE FORMS
          </p>
          {/* the stamp a till presses on a completed docket */}
          <p
            className="-rotate-6 border-4 px-5 py-2 text-2xl tracking-[0.2em]"
            style={{ borderColor: STAMP, color: STAMP }}
          >
            RECORDED
          </p>
          <p className="text-xs" style={{ color: FADED }}>
            your response has been saved
          </p>
          <Barcode seed={form.id} />
          <p className="text-[10px] tracking-[0.3em]" style={{ color: FADED }}>
            * * THANK YOU * *
          </p>
        </div>
      </Strip>
    );
  }

  return (
    <Strip>
      {/* the header a till prints: shop, then what the docket is for */}
      <header className="text-center font-mono">
        <p className="text-[11px] tracking-[0.35em]" style={{ color: FADED }}>
          GENZEE FORMS
        </p>
        <h1 className="mt-2 text-base font-bold tracking-widest uppercase wrap-break-word">
          {form.title}
        </h1>
        {form.description && (
          <p className="mt-2 text-[11px] leading-relaxed wrap-break-word" style={{ color: FADED }}>
            {form.description}
          </p>
        )}
        {/* the id doubles as a docket number, and needs no clock to stay stable */}
        <p className="mt-2 text-[10px] tracking-widest" style={{ color: FADED }}>
          DOCKET #{form.id.slice(0, 8).toUpperCase()}
        </p>
      </header>

      <Rule />

      {/* noValidate for the same reason as the other templates: the browser's own
          tooltip on an `email` input blocks submit with no submit event */}
      <form onSubmit={onSubmit} noValidate>
        {total === 0 && (
          <p className="py-4 text-center font-mono text-xs" style={{ color: FADED }}>
            NO ITEMS ON THIS DOCKET
          </p>
        )}

        <ol className="flex flex-col gap-5">
          {form.fields.map((field, index) => {
            const errorMessage = errors[field.labelKey]?.message as string | undefined;
            const { helperText } = parseFieldDescription(field.description);

            return (
              <li key={field.id} className="flex flex-col gap-2">
                {/* the itemised line: a number, then what is being asked for */}
                <label
                  htmlFor={field.type === "YES_NO" ? undefined : field.id}
                  className="flex items-baseline gap-2 font-mono text-[11px] tracking-widest uppercase"
                >
                  <span style={{ color: FADED }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 wrap-break-word">{field.label}</span>
                  {field.isRequired && <span style={{ color: STAMP }}>*</span>}
                </label>

                {helperText && (
                  <p
                    className="font-mono text-[10px] leading-relaxed wrap-break-word"
                    style={{ color: FADED }}
                  >
                    {helperText}
                  </p>
                )}

                <Printed
                  field={field}
                  register={register}
                  control={control}
                  invalid={!!errorMessage}
                />

                {errorMessage && (
                  <p
                    className="font-mono text-[10px] tracking-wide wrap-break-word uppercase"
                    style={{ color: STAMP }}
                  >
                    ! {errorMessage}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <Rule />

        {/* the totals block, tallying items instead of money */}
        <dl className="flex flex-col gap-1 font-mono text-[11px] tracking-widest uppercase">
          <div className="flex justify-between">
            <dt style={{ color: FADED }}>Items</dt>
            <dd>{total}</dd>
          </div>
          <div className="flex justify-between">
            <dt style={{ color: FADED }}>Required</dt>
            <dd>{requiredCount}</dd>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <dt>Total</dt>
            <dd>{total} ITEM{total === 1 ? "" : "S"}</dd>
          </div>
        </dl>

        <Rule />

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full border-2 py-3 font-mono text-xs tracking-[0.3em] uppercase transition-colors disabled:opacity-50",
            "hover:bg-[#2a2a2a] hover:text-[#fdfdfb]",
          )}
          style={{ borderColor: INK, color: INK }}
        >
          {isSubmitting ? "Printing…" : "Submit docket"}
        </button>

        <div className="mt-5">
          <Barcode seed={form.id} />
          <p
            className="mt-1 text-center font-mono text-[10px] tracking-[0.3em]"
            style={{ color: FADED }}
          >
            * * THANK YOU * *
          </p>
        </div>
      </form>
    </Strip>
  );
}
