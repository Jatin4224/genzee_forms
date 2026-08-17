"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as a worksheet. Column A lists the questions, column B is where the
 * answers are typed, and the cell you are in is reported back in the formula bar.
 * Like Classic, Paper and Comic it shows every question at once.
 *
 * Hard-coded light chrome, so the sheet looks the same in either theme - it is
 * the second bright template after Comic.
 */

const GRID = "#dadce0";
const INK = "#202124";
const MUTED = "#5f6368";
const SELECTED = "#1a73e8";
const GREEN = "#0f9d58";
const RED = "#d93025";

//row 1 is the header, so the first question lands on row 2
const FIRST_DATA_ROW = 2;

//the three-column layout every row shares: row number, question, answer
const ROW_GRID = "grid grid-cols-[34px_minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)]";

//what the formula bar reports for the cell being edited
function formulaFor(field: PublicFormField | undefined) {
  if (!field) return "";

  //quotes inside a label would break out of the string in a real formula
  return `=ANSWER("${field.label.replace(/"/g, "'")}")`;
}

//the answer cell. text-like types are typed straight in; yes/no becomes the
//TRUE/FALSE chips a data-validation column would show
function Cell({
  field,
  register,
  control,
  invalid,
  onFocus,
}: {
  field: PublicFormField;
  register: FormTemplateProps["register"];
  control: FormTemplateProps["control"];
  invalid: boolean;
  onFocus: () => void;
}) {
  if (field.type === "YES_NO") {
    return (
      <Controller
        control={control}
        name={field.labelKey}
        //null, not false: false is a real answer (FALSE), so it cannot double as
        //"not answered yet" - see getFieldRules
        defaultValue={null}
        rules={getFieldRules(field)}
        render={({ field: controlled }) => (
          <div className="flex h-full items-center gap-1.5 px-2 py-1.5">
            {[
              { label: "TRUE", value: true },
              { label: "FALSE", value: false },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onFocus={onFocus}
                onClick={() => {
                  controlled.onChange(option.value);
                  onFocus();
                }}
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-colors",
                  controlled.value === option.value
                    ? "bg-[#1a73e8] text-white"
                    : "bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]",
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
      id={field.id}
      type={getInputType(field)}
      placeholder={field.placeholder ?? ""}
      autoComplete="off"
      aria-invalid={invalid}
      onFocus={onFocus}
      //the cell has no chrome of its own; the row draws the grid lines around it
      className="h-full w-full bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[#9aa0a6]"
      style={{ color: INK }}
    />
  );
}

export function SpreadsheetTemplate({
  form,
  register,
  control,
  errors,
  isSubmitting,
  isSuccess,
  onSubmit,
}: FormTemplateProps) {
  //which row is being edited, so the name box and formula bar can report it
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeField = activeIndex === null ? undefined : form.fields[activeIndex];
  const cellRef = activeIndex === null ? "" : `B${activeIndex + FIRST_DATA_ROW}`;

  return (
    <div className="min-h-svh w-full bg-[#f8f9fa]" style={{ color: INK }}>
      {/* the app bar, with the form standing in for the document name */}
      <header className="flex items-center gap-3 px-4 py-3 sm:px-6" style={{ backgroundColor: GREEN }}>
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded bg-white/25 font-mono text-xs text-white"
        >
          ▦
        </span>
        <p className="min-w-0 flex-1 truncate text-base text-white">{form.title}</p>
        <span className="shrink-0 font-mono text-[11px] text-white/80">
          {form.fields.length} row{form.fields.length === 1 ? "" : "s"}
        </span>
      </header>

      <div className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-6 sm:py-6">
        {/* the name box and formula bar, reporting whichever cell has focus */}
        <div className="flex items-stretch overflow-hidden rounded-t-md border" style={{ borderColor: GRID }}>
          <span
            className="grid w-16 shrink-0 place-items-center border-r bg-white font-mono text-xs sm:w-20"
            style={{ borderColor: GRID, color: MUTED }}
          >
            {cellRef || "—"}
          </span>
          <span
            className="grid w-9 shrink-0 place-items-center border-r bg-white font-mono text-xs italic"
            style={{ borderColor: GRID, color: MUTED }}
          >
            fx
          </span>
          <span className="min-w-0 flex-1 truncate bg-white px-3 py-2 font-mono text-xs" style={{ color: MUTED }}>
            {formulaFor(activeField)}
          </span>
        </div>

        {/* noValidate for the same reason as the other templates: the browser's own
            tooltip on an `email` input blocks submit with no submit event */}
        <form onSubmit={onSubmit} noValidate>
          {/* once the response is in, the sheet stays on screen to read back but is
              no longer editable - a disabled fieldset does that for every control */}
          <fieldset disabled={isSuccess} className="m-0 border-0 p-0">
          <div className="overflow-hidden rounded-b-md border border-t-0 bg-white" style={{ borderColor: GRID }}>
            {/* column headers */}
            <div className={cn(ROW_GRID, "border-b bg-[#f1f3f4]")} style={{ borderColor: GRID }}>
              <span aria-hidden className="border-r" style={{ borderColor: GRID }} />
              {["A", "B"].map((column) => (
                <span
                  key={column}
                  className="border-r px-2 py-1.5 text-center font-mono text-[11px] last:border-r-0"
                  style={{ borderColor: GRID, color: MUTED }}
                >
                  {column}
                </span>
              ))}
            </div>

            {/* row 1: the header row of the sheet itself */}
            <div className={cn(ROW_GRID, "border-b")} style={{ borderColor: GRID }}>
              <span
                className="grid place-items-center border-r bg-[#f1f3f4] font-mono text-[11px]"
                style={{ borderColor: GRID, color: MUTED }}
              >
                1
              </span>
              <span className="border-r px-2 py-2 text-sm font-medium" style={{ borderColor: GRID }}>
                Question
              </span>
              <span className="px-2 py-2 text-sm font-medium">Answer</span>
            </div>

            {form.fields.length === 0 && (
              <div className={cn(ROW_GRID)}>
                <span
                  className="grid place-items-center border-r bg-[#f1f3f4] font-mono text-[11px]"
                  style={{ borderColor: GRID, color: MUTED }}
                >
                  2
                </span>
                <span className="col-span-2 px-2 py-3 text-sm" style={{ color: MUTED }}>
                  This sheet is empty.
                </span>
              </div>
            )}

            {form.fields.map((field, index) => {
              const errorMessage = errors[field.labelKey]?.message as string | undefined;
              const { helperText } = parseFieldDescription(field.description);
              const isActive = activeIndex === index;

              return (
                <div
                  key={field.id}
                  className={cn(ROW_GRID, "border-b last:border-b-0")}
                  style={{ borderColor: GRID }}
                >
                  <span
                    className={cn(
                      "grid place-items-center border-r font-mono text-[11px]",
                      isActive ? "bg-[#e8f0fe]" : "bg-[#f1f3f4]",
                    )}
                    style={{ borderColor: GRID, color: MUTED }}
                  >
                    {index + FIRST_DATA_ROW}
                  </span>

                  {/* column A: the question, plus its note underneath */}
                  <label
                    htmlFor={field.type === "YES_NO" ? undefined : field.id}
                    className="flex min-w-0 flex-col justify-center gap-0.5 border-r px-2 py-2"
                    style={{ borderColor: GRID }}
                  >
                    <span className="text-sm wrap-break-word">
                      {field.label}
                      {field.isRequired && <span style={{ color: RED }}> *</span>}
                    </span>
                    {helperText && (
                      <span className="text-[11px] wrap-break-word" style={{ color: MUTED }}>
                        {helperText}
                      </span>
                    )}
                  </label>

                  {/* column B: the answer cell, outlined while it has focus */}
                  <div className="relative min-w-0">
                    {/* an inset shadow rather than a ring utility, so the outline
                        sits inside the cell instead of overlapping its neighbours */}
                    <div
                      className="h-full"
                      style={isActive ? { boxShadow: `inset 0 0 0 2px ${SELECTED}` } : undefined}
                    >
                      <Cell
                        field={field}
                        register={register}
                        control={control}
                        invalid={!!errorMessage}
                        onFocus={() => setActiveIndex(index)}
                      />
                    </div>

                    {/* the fill handle a selected cell carries in its corner */}
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute -right-0.75 -bottom-0.75 size-1.5 rounded-[1px]"
                        style={{ backgroundColor: SELECTED }}
                      />
                    )}

                    {errorMessage && (
                      <p
                        className="px-2 pb-1.5 text-[11px] wrap-break-word"
                        style={{ color: RED }}
                      >
                        {errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </fieldset>

          {/* the sheet tab strip, with submit sitting where a toolbar action would */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="rounded-t border-b-2 bg-white px-3 py-1.5 text-xs"
                style={{ borderColor: GREEN, color: INK }}
              >
                {isSuccess ? "Submitted" : "Sheet1"}
              </span>
              <span className="font-mono text-sm" style={{ color: MUTED }} aria-hidden>
                +
              </span>
            </div>

            {isSuccess ? (
              <p className="font-mono text-xs" style={{ color: GREEN }}>
                ✓ response recorded
              </p>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded px-5 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: SELECTED }}
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
