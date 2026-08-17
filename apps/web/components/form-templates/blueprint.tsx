"use client";

import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as a drawing sheet. Questions are dimensioned like features on a
 * technical drawing, the sheet is framed with zone markers, and a title block
 * closes it off. Like the other document styles it shows every question at once.
 *
 * Hard-coded cyan-on-navy, so the sheet prints the same in either theme.
 */

const PAPER = "#0e2c4a";
const LINE = "#8fd3ff";
const LINE_DIM = "rgba(143,211,255,0.45)";
const REVISION = "#ff9f76";

//blueprint paper: a fine grid with a heavier line every fifth division
const GRID = {
  backgroundImage: [
    "repeating-linear-gradient(to right, rgba(143,211,255,0.16) 0 1px, transparent 1px 50px)",
    "repeating-linear-gradient(to bottom, rgba(143,211,255,0.16) 0 1px, transparent 1px 50px)",
    "repeating-linear-gradient(to right, rgba(143,211,255,0.07) 0 1px, transparent 1px 10px)",
    "repeating-linear-gradient(to bottom, rgba(143,211,255,0.07) 0 1px, transparent 1px 10px)",
  ].join(","),
} as const;

//the zone references printed along the edges of a drawing sheet
const ZONE_COLUMNS = ["1", "2", "3", "4", "5", "6"] as const;
const ZONE_ROWS = ["A", "B", "C", "D"] as const;

//a dimension line: arrowheads at both ends with the item number called out between
function DimensionLine({ label }: { label: string }) {
  return (
    <div aria-hidden className="flex items-center gap-2" style={{ color: LINE_DIM }}>
      <span className="text-[10px] leading-none">◂</span>
      <span className="h-px flex-1" style={{ backgroundColor: LINE_DIM }} />
      <span className="font-mono text-[10px] tracking-[0.2em]">{label}</span>
      <span className="h-px flex-1" style={{ backgroundColor: LINE_DIM }} />
      <span className="text-[10px] leading-none">▸</span>
    </div>
  );
}

//an L-shaped registration mark, one at each corner of the sheet
function CornerMark({ position }: { position: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute size-4 border-[#8fd3ff]/60", position)}
    />
  );
}

//the value written against a feature. text-like types sit on a leader line,
//yes/no is called out as two boxed options
function Callout({
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
        //null, not false: false is a real answer ("NO"), so it cannot double as
        //"not answered yet" - see getFieldRules
        defaultValue={null}
        rules={getFieldRules(field)}
        render={({ field: controlled }) => (
          <div className="flex items-center gap-5">
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
                  className="flex items-center gap-2 font-mono text-sm tracking-widest transition-opacity"
                  style={{ color: selected ? LINE : LINE_DIM }}
                >
                  <span
                    aria-hidden
                    className="grid size-4 place-items-center border text-[11px] leading-none"
                    style={{ borderColor: invalid ? REVISION : LINE_DIM }}
                  >
                    {selected ? "×" : ""}
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
      //written on the leader line, in the mono a drawing is annotated in
      className="w-full border-b bg-transparent pb-1 font-mono text-base tracking-wide uppercase outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8fd3ff]/25"
      style={{ color: LINE, borderColor: invalid ? REVISION : LINE_DIM, caretColor: LINE }}
    />
  );
}

//the sheet: grid paper inside a drawn frame with zone references
function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#081b2e] px-3 py-8 sm:px-6 sm:py-12">
      <div
        className="relative h-fit w-full max-w-4xl shadow-[0_22px_55px_-18px_rgba(0,0,0,0.8)]"
        style={{ backgroundColor: PAPER, ...GRID }}
      >
        {/* the drawn border, inset from the trim like a real sheet */}
        <div className="absolute inset-2 border" style={{ borderColor: LINE_DIM }} />

        <CornerMark position="top-4 left-4 border-t-2 border-l-2" />
        <CornerMark position="top-4 right-4 border-t-2 border-r-2" />
        <CornerMark position="bottom-4 left-4 border-b-2 border-l-2" />
        <CornerMark position="bottom-4 right-4 border-r-2 border-b-2" />

        {/* zone references along the top and down the left */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-3 flex justify-between font-mono text-[9px]"
          style={{ color: LINE_DIM }}
        >
          {ZONE_COLUMNS.map((zone) => (
            <span key={zone}>{zone}</span>
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-10 left-3 flex flex-col justify-between font-mono text-[9px]"
          style={{ color: LINE_DIM }}
        >
          {ZONE_ROWS.map((zone) => (
            <span key={zone}>{zone}</span>
          ))}
        </div>

        <div className="relative px-8 py-10 sm:px-12 sm:py-12">{children}</div>
      </div>
    </div>
  );
}

//the title block a drawing carries in its bottom corner
function TitleBlock({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl
      className="grid grid-cols-2 border font-mono sm:grid-cols-4"
      style={{ borderColor: LINE_DIM, color: LINE }}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="min-w-0 border-r border-b p-2 last:border-r-0"
          style={{ borderColor: LINE_DIM }}
        >
          <dt className="text-[9px] tracking-[0.2em]" style={{ color: LINE_DIM }}>
            {row.label}
          </dt>
          <dd className="truncate text-xs tracking-wide uppercase">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BlueprintTemplate({
  form,
  register,
  control,
  errors,
  isSubmitting,
  isSuccess,
  onSubmit,
}: FormTemplateProps) {
  const drawingNo = form.id.slice(0, 8).toUpperCase();

  const titleBlockRows = [
    { label: "TITLE", value: form.title },
    { label: "DWG NO.", value: drawingNo },
    { label: "FEATURES", value: String(form.fields.length) },
    { label: "SCALE", value: "1:1" },
  ];

  if (isSuccess) {
    return (
      <Sheet>
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <div
            className="-rotate-6 border-4 px-8 py-3 font-mono text-3xl tracking-[0.2em]"
            style={{ borderColor: LINE, color: LINE }}
          >
            ISSUED
          </div>
          <p className="font-mono text-xs tracking-widest" style={{ color: LINE_DIM }}>
            YOUR RESPONSE HAS BEEN RECORDED
          </p>
          <div className="w-full max-w-lg">
            <TitleBlock rows={titleBlockRows} />
          </div>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.3em]" style={{ color: LINE_DIM }}>
            DRAWING {drawingNo}
          </p>
          <h1
            className="font-mono text-xl tracking-widest wrap-break-word uppercase sm:text-2xl"
            style={{ color: LINE }}
          >
            {form.title}
          </h1>
        </div>
        <p className="font-mono text-[10px] tracking-[0.25em]" style={{ color: LINE_DIM }}>
          SHEET 1 OF 1
        </p>
      </header>

      {form.description && (
        <p
          className="mt-3 max-w-2xl font-mono text-xs leading-relaxed wrap-break-word"
          style={{ color: LINE_DIM }}
        >
          NOTE: {form.description}
        </p>
      )}

      <div className="my-8 h-px w-full" style={{ backgroundColor: LINE_DIM }} />

      {/* noValidate for the same reason as the other templates: the browser's own
          tooltip on an `email` input blocks submit with no submit event */}
      <form onSubmit={onSubmit} noValidate>
        {form.fields.length === 0 && (
          <p className="font-mono text-sm tracking-widest" style={{ color: LINE_DIM }}>
            NO FEATURES DIMENSIONED ON THIS SHEET
          </p>
        )}

        <ol className="flex flex-col gap-9">
          {form.fields.map((field, index) => {
            const errorMessage = errors[field.labelKey]?.message as string | undefined;
            const { helperText } = parseFieldDescription(field.description);
            const itemNo = String(index + 1).padStart(2, "0");

            return (
              <li key={field.id} className="flex flex-col gap-2.5">
                <DimensionLine label={itemNo} />

                <label
                  htmlFor={field.type === "YES_NO" ? undefined : field.id}
                  className="font-mono text-sm tracking-[0.15em] wrap-break-word uppercase"
                  style={{ color: LINE }}
                >
                  {field.label}
                  {field.isRequired && <span style={{ color: REVISION }}> ✳</span>}
                </label>

                {helperText && (
                  <p
                    className="font-mono text-[11px] leading-relaxed wrap-break-word"
                    style={{ color: LINE_DIM }}
                  >
                    ── {helperText}
                  </p>
                )}

                <Callout
                  field={field}
                  register={register}
                  control={control}
                  invalid={!!errorMessage}
                />

                {errorMessage && (
                  <p
                    className="font-mono text-[11px] tracking-wide wrap-break-word uppercase"
                    style={{ color: REVISION }}
                  >
                    REV: {errorMessage}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-12 flex flex-col gap-6">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="border-2 px-7 py-2.5 font-mono text-sm tracking-[0.25em] transition-colors hover:bg-[#8fd3ff]/10 disabled:opacity-50"
              style={{ borderColor: LINE, color: LINE }}
            >
              {isSubmitting ? "ISSUING…" : "ISSUE DRAWING"}
            </button>
          </div>

          <TitleBlock rows={titleBlockRows} />

          <p className="text-right font-mono text-[9px] tracking-[0.2em]" style={{ color: LINE_DIM }}>
            ✳ DENOTES A REQUIRED FEATURE
          </p>
        </div>
      </form>
    </Sheet>
  );
}
