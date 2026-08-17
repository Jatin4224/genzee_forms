"use client";

import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as the data page of a passport. Questions are set out as document
 * fields, visa stamps sit across the page, and a machine-readable strip closes it
 * off. Like the other document styles it shows every question at once.
 *
 * Hard-coded ink-on-document colours, so the page reads the same in either theme.
 */

const COVER = "#16233d";
const PAGE = "#f4f0e2";
const INK = "#1e2733";
const MUTED = "#7c7565";
const GOLD = "#b8974a";
const STAMP_GREEN = "#2f6b4f";
const STAMP_RED = "#8a3b3b";

//the guilloche a security document prints under its data
const GUILLOCHE = {
  backgroundImage: [
    "repeating-radial-gradient(circle at 15% 25%, rgba(47,107,79,0.07) 0 1px, transparent 1px 9px)",
    "repeating-radial-gradient(circle at 82% 70%, rgba(22,35,61,0.06) 0 1px, transparent 1px 11px)",
    "repeating-linear-gradient(115deg, rgba(22,35,61,0.035) 0 1px, transparent 1px 8px)",
  ].join(","),
} as const;

//the stamps are decoration: fixed placements, and never in the way of an input
const STAMPS = [
  { label: "ENTRY", sub: "GENZEE", top: "12%", left: "62%", rotate: -14, colour: STAMP_GREEN },
  { label: "CHECKED", sub: "DESK 01", top: "48%", left: "10%", rotate: 9, colour: STAMP_RED },
  { label: "TRANSIT", sub: "GATE 7", top: "70%", left: "68%", rotate: -6, colour: STAMP_GREEN },
] as const;

//one line of the machine-readable zone. built from the form, so it is stable
//between the server render and the client
function mrzLine(text: string, length = 44) {
  const cleaned = text.toUpperCase().replace(/[^A-Z0-9]+/g, "<");
  return `${cleaned}${"<".repeat(length)}`.slice(0, length);
}

//passports label their fields in two languages; the second is decoration here
const FRENCH_LABEL = "/ CHAMP";

function VisaStamp({ stamp }: { stamp: (typeof STAMPS)[number] }) {
  return (
    <div
      aria-hidden
      className="absolute grid size-24 place-items-center rounded-full border-4 text-center opacity-25 sm:size-28"
      style={{
        top: stamp.top,
        left: stamp.left,
        transform: `rotate(${stamp.rotate}deg)`,
        borderColor: stamp.colour,
        color: stamp.colour,
      }}
    >
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] sm:text-xs">{stamp.label}</p>
        <p className="font-mono text-[8px] tracking-widest sm:text-[10px]">{stamp.sub}</p>
      </div>
    </div>
  );
}

//the value written into a document field. text-like types are typed on the rule,
//yes/no is ticked in the two boxes an official form would give
function Entry({
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
          <div className="flex items-center gap-4">
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
                  className="flex items-center gap-2 font-mono text-sm tracking-widest"
                  style={{ color: selected ? INK : MUTED }}
                >
                  <span
                    aria-hidden
                    className="grid size-4 place-items-center border text-[11px] leading-none"
                    style={{ borderColor: invalid ? STAMP_RED : MUTED }}
                  >
                    {selected ? "X" : ""}
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
      //typed straight onto the document, in the mono a data page is printed in
      className="w-full border-b bg-transparent pb-1 font-mono text-base tracking-wide uppercase outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-black/25"
      style={{ color: INK, borderColor: invalid ? STAMP_RED : "rgba(30,39,51,0.25)" }}
    />
  );
}

//the booklet: navy cover, gold rule, and the data page inside it
function Booklet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#0d1424] px-3 py-8 sm:px-6 sm:py-12">
      <div
        className="h-fit w-full max-w-3xl rounded-md p-3 shadow-[0_22px_55px_-18px_rgba(0,0,0,0.85)] sm:p-5"
        style={{ backgroundColor: COVER, border: `1px solid ${GOLD}` }}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="font-mono text-[10px] tracking-[0.3em] sm:text-xs" style={{ color: GOLD }}>
            PASSPORT / PASSEPORT
          </p>
          <span aria-hidden style={{ color: GOLD }}>
            ✦
          </span>
        </div>

        <div className="relative overflow-hidden rounded-sm" style={{ backgroundColor: PAGE, color: INK }}>
          <div aria-hidden className="pointer-events-none absolute inset-0" style={GUILLOCHE} />
          {children}
        </div>
      </div>
    </div>
  );
}

export function PassportTemplate({
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
      <Booklet>
        <div className="relative flex flex-col items-center gap-6 px-6 py-20 text-center">
          <div
            className="-rotate-12 rounded-md border-4 px-8 py-4"
            style={{ borderColor: STAMP_GREEN, color: STAMP_GREEN }}
          >
            <p className="font-mono text-3xl tracking-[0.2em]">APPROVED</p>
          </div>
          <p className="font-mono text-xs tracking-widest" style={{ color: MUTED }}>
            YOUR RESPONSE HAS BEEN RECORDED
          </p>
        </div>
      </Booklet>
    );
  }

  return (
    <Booklet>
      {/* the stamps sit above the guilloche but below everything you can click */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {STAMPS.map((stamp) => (
          <VisaStamp key={stamp.label} stamp={stamp} />
        ))}
      </div>

      <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8">
        {/* the document header strip */}
        <header
          className="flex flex-wrap items-end justify-between gap-3 border-b pb-4"
          style={{ borderColor: "rgba(30,39,51,0.2)" }}
        >
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.3em]" style={{ color: MUTED }}>
              TYPE / CODE / DOCUMENT NO.
            </p>
            <p className="font-mono text-sm tracking-widest">
              P &nbsp; GZE &nbsp; {form.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <h1 className="min-w-0 text-right text-lg wrap-break-word uppercase sm:text-xl">
            {form.title}
          </h1>
        </header>

        {form.description && (
          <p className="mt-3 text-xs wrap-break-word" style={{ color: MUTED }}>
            {form.description}
          </p>
        )}

        {/* noValidate for the same reason as the other templates: the browser's own
            tooltip on an `email` input blocks submit with no submit event */}
        <form onSubmit={onSubmit} noValidate className="mt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            {/* the portrait box, printed but never filled in */}
            <div className="shrink-0">
              <div
                className="grid h-40 w-32 place-items-center border"
                style={{
                  borderColor: "rgba(30,39,51,0.3)",
                  backgroundImage: "linear-gradient(160deg,rgba(47,107,79,0.14),rgba(22,35,61,0.16))",
                }}
              >
                <span className="font-mono text-[10px] tracking-widest" style={{ color: MUTED }}>
                  PHOTO
                </span>
              </div>
              <p className="mt-2 font-mono text-[9px] tracking-widest" style={{ color: MUTED }}>
                {form.fields.length} FIELD{form.fields.length === 1 ? "" : "S"}
              </p>
            </div>

            <div className="min-w-0 flex-1">
              {form.fields.length === 0 && (
                <p className="font-mono text-sm tracking-widest" style={{ color: MUTED }}>
                  NO FIELDS ON THIS DOCUMENT
                </p>
              )}

              <ol className="flex flex-col gap-5">
                {form.fields.map((field, index) => {
                  const errorMessage = errors[field.labelKey]?.message as string | undefined;
                  const { helperText } = parseFieldDescription(field.description);

                  return (
                    <li key={field.id} className="flex flex-col gap-1.5">
                      <label
                        htmlFor={field.type === "YES_NO" ? undefined : field.id}
                        className="flex flex-wrap items-baseline gap-x-2 font-mono text-[10px] tracking-[0.22em] uppercase"
                        style={{ color: MUTED }}
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 wrap-break-word" style={{ color: INK }}>
                          {field.label}
                        </span>
                        <span>{FRENCH_LABEL}</span>
                        {field.isRequired && <span style={{ color: STAMP_RED }}>*</span>}
                      </label>

                      {helperText && (
                        <p className="text-[11px] wrap-break-word" style={{ color: MUTED }}>
                          {helperText}
                        </p>
                      )}

                      <Entry
                        field={field}
                        register={register}
                        control={control}
                        invalid={!!errorMessage}
                      />

                      {errorMessage && (
                        <p
                          className="font-mono text-[10px] tracking-wide wrap-break-word uppercase"
                          style={{ color: STAMP_RED }}
                        >
                          {errorMessage}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "border-2 px-7 py-2.5 font-mono text-sm tracking-[0.25em] transition-colors disabled:opacity-50",
                "hover:bg-[#2f6b4f]/10",
              )}
              style={{ borderColor: STAMP_GREEN, color: STAMP_GREEN }}
            >
              {isSubmitting ? "STAMPING…" : "STAMP & SUBMIT"}
            </button>
          </div>
        </form>
      </div>

      {/* the machine-readable zone across the foot of the page */}
      <div
        className="relative z-10 border-t px-5 py-3 sm:px-8"
        style={{ borderColor: "rgba(30,39,51,0.2)", backgroundColor: "rgba(255,255,255,0.35)" }}
      >
        <p className="overflow-hidden font-mono text-[10px] leading-relaxed tracking-[0.12em] whitespace-nowrap sm:text-xs">
          {mrzLine(`P<GZE<<${form.title}`)}
        </p>
        <p className="overflow-hidden font-mono text-[10px] leading-relaxed tracking-[0.12em] whitespace-nowrap sm:text-xs">
          {mrzLine(`${form.id}<<${form.fields.length}`)}
        </p>
      </div>
    </Booklet>
  );
}
