"use client";

import { useEffect, useState } from "react";
import { Controller, useWatch } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as a vending machine. Questions sit behind the glass as coded slots, you
 * pick one from the grid or punch its code on the keypad, and the answer is typed
 * into the tray at the bottom.
 *
 * Only one answer is on screen at a time, but every input stays mounted - see the
 * note on the tray below. Hard-coded machine colours, always dark.
 */

const LED = "#7ee787";
const GLASS = "#0d1512";
const CHASSIS = "#8e1b16";
const METAL = "#2a2a2a";
const DIM = "#8b949e";
const RED = "#ff6b6b";

//the display case is three slots wide, so codes read A1..A3, B1..B3 and so on
const COLUMNS = 3;

function slotCode(index: number) {
  const row = String.fromCharCode(65 + Math.floor(index / COLUMNS));
  return `${row}${(index % COLUMNS) + 1}`;
}

//the row letters the keypad offers, one per row of slots actually in the machine
function rowLetters(total: number) {
  const rows = Math.max(Math.ceil(total / COLUMNS), 1);
  return Array.from({ length: rows }, (_, index) => String.fromCharCode(65 + index));
}

//what a slot shows once it has been answered
function stockedLabel(field: PublicFormField, value: unknown) {
  if (field.type === "YES_NO") return value === true ? "YES" : value === false ? "NO" : "";

  const text = String(value ?? "").trim();
  if (!text) return "";
  if (field.type === "PASSWORD") return "•".repeat(Math.min(text.length, 8));

  return text.length > 12 ? `${text.slice(0, 11)}…` : text;
}

export function VendingTemplate({
  form,
  register,
  control,
  errors,
  isSubmitting,
  isSuccess,
  onSubmit,
  isPreview,
}: FormTemplateProps) {
  const total = form.fields.length;

  const [active, setActive] = useState(() => (isPreview ? Math.min(1, Math.max(total - 1, 0)) : 0));
  //the code being punched in: "" then "B" then "B2", which selects and clears
  const [entry, setEntry] = useState("");
  const [rejected, setRejected] = useState(false);

  //every answer, so a slot can show what is already stocked in it
  const values = useWatch({ control });

  const activeField = form.fields[Math.min(active, Math.max(total - 1, 0))];
  const activeError = activeField
    ? (errors[activeField.labelKey]?.message as string | undefined)
    : undefined;

  //a hidden slot's error would be invisible, so bring the first faulty one up on
  //the display. keyed on the list of faulty codes so it settles after one pass
  const errorKeys = form.fields
    .filter((field) => errors[field.labelKey])
    .map((field) => field.labelKey)
    .join(",");

  useEffect(() => {
    if (!errorKeys) return;

    const first = form.fields.findIndex((field) => errors[field.labelKey]);
    if (first >= 0) setActive(first);
    //errors is deliberately not a dependency: errorKeys already summarises it, and
    //depending on the object itself would re-run on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorKeys]);

  const select = (index: number) => {
    if (isPreview) return;
    setActive(index);
    setEntry("");
    setRejected(false);
  };

  //punching a code: a letter picks the row, the digit that follows picks the slot
  const punch = (key: string) => {
    if (isPreview) return;

    setRejected(false);

    if (key === "CLR") {
      setEntry("");
      return;
    }

    if (/[A-Z]/.test(key)) {
      setEntry(key);
      return;
    }

    if (!entry) {
      setRejected(true);
      return;
    }

    const code = `${entry}${key}`;
    const index = form.fields.findIndex((_, position) => slotCode(position) === code);

    if (index < 0) {
      setEntry("");
      setRejected(true);
      return;
    }

    setActive(index);
    setEntry("");
  };

  if (isSuccess || total === 0) {
    return (
      <Machine>
        <div className="flex flex-col items-center gap-4 py-16 text-center font-mono">
          <p className="text-3xl tracking-widest" style={{ color: LED }}>
            {total === 0 ? "OUT OF STOCK" : "THANK YOU"}
          </p>
          <p className="text-xs" style={{ color: DIM }}>
            {total === 0
              ? "this machine has nothing in it yet"
              : "your response has been recorded"}
          </p>
        </div>
      </Machine>
    );
  }

  if (!activeField) return null;

  const { helperText } = parseFieldDescription(activeField.description);

  return (
    <Machine>
      {/* noValidate for the same reason as the other templates: the browser's own
          tooltip on an `email` input blocks submit with no submit event */}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          {/* the display case */}
          <div
            className="relative rounded-lg border-4 p-3 sm:p-4"
            style={{ borderColor: METAL, backgroundColor: GLASS }}
          >
            {/* the sheen across the glass */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded bg-linear-to-br from-white/10 via-transparent to-white/5"
            />

            <div className="relative grid grid-cols-3 gap-2 sm:gap-3">
              {form.fields.map((field, index) => {
                const stocked = stockedLabel(field, values?.[field.labelKey]);
                const faulty = !!errors[field.labelKey];
                const isActive = index === active;

                return (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => select(index)}
                    aria-pressed={isActive}
                    className={cn(
                      "flex min-h-24 flex-col justify-between rounded border-2 p-2 text-left transition-colors",
                      isActive ? "bg-[#7ee787]/10" : "bg-black/30 hover:bg-black/15",
                    )}
                    style={{
                      borderColor: faulty ? RED : isActive ? LED : "rgba(255,255,255,0.14)",
                    }}
                  >
                    <span className="flex items-baseline justify-between gap-1 font-mono text-[11px]">
                      <span style={{ color: faulty ? RED : LED }}>{slotCode(index)}</span>
                      {field.isRequired && <span style={{ color: RED }}>*</span>}
                    </span>

                    <span className="line-clamp-3 text-[11px] leading-tight wrap-break-word text-white/75">
                      {field.label}
                    </span>

                    {/* what is already loaded into this slot */}
                    <span
                      className="truncate font-mono text-[10px]"
                      style={{ color: stocked ? LED : DIM }}
                    >
                      {stocked || "empty"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* the control panel */}
          <div className="flex flex-col gap-3 rounded-lg border-4 p-3" style={{ borderColor: METAL, backgroundColor: "#141414" }}>
            {/* the led readout */}
            <div className="rounded border border-white/10 bg-black px-3 py-2 font-mono">
              <p className="text-[10px] tracking-[0.3em]" style={{ color: DIM }}>
                SELECT
              </p>
              <p className="text-2xl tracking-widest" style={{ color: rejected ? RED : LED }}>
                {rejected ? "ERR" : entry || slotCode(active)}
                <span className="animate-pulse">_</span>
              </p>
            </div>

            {/* the keypad: a row letter, then a column digit */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {rowLetters(total).map((letter) => (
                  <Key key={letter} label={letter} onPress={() => punch(letter)} active={entry === letter} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: COLUMNS }, (_, index) => String(index + 1)).map((digit) => (
                  <Key key={digit} label={digit} onPress={() => punch(digit)} />
                ))}
                <Key label="CLR" onPress={() => punch("CLR")} wide />
              </div>
            </div>

            <p className="font-mono text-[10px] leading-relaxed" style={{ color: DIM }}>
              punch a row then a column, or tap a slot
            </p>
          </div>
        </div>

        {/* the delivery tray.
            every field's input is rendered here, not just the selected one - an
            input that is never mounted is never registered, so react-hook-form
            would skip validating it and a required question could be submitted
            blank. the others are hidden rather than absent */}
        <div className="rounded-lg border-4 p-4" style={{ borderColor: METAL, backgroundColor: "#141414" }}>
          <p className="font-mono text-[10px] tracking-[0.3em]" style={{ color: DIM }}>
            TRAY — {slotCode(active)}
          </p>

          <p className="mt-1.5 text-sm wrap-break-word text-white">
            {activeField.label}
            {activeField.isRequired && <span style={{ color: RED }}> *</span>}
          </p>

          {helperText && (
            <p className="mt-1 text-xs wrap-break-word" style={{ color: DIM }}>
              {helperText}
            </p>
          )}

          <div className="mt-3">
            {form.fields.map((field, index) => (
              <div key={field.id} className={cn(index !== active && "hidden")}>
                <Slot
                  field={field}
                  register={register}
                  control={control}
                  invalid={!!errors[field.labelKey]}
                  autoFocus={!isPreview && index === active}
                />
              </div>
            ))}
          </div>

          {activeError && (
            <p className="mt-2 font-mono text-xs wrap-break-word" style={{ color: RED }}>
              ! {activeError}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px]" style={{ color: DIM }}>
              {active + 1} / {total}
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded border-2 px-6 py-2 font-mono text-sm tracking-[0.2em] transition-colors hover:bg-[#7ee787]/15 disabled:opacity-50"
              style={{ borderColor: LED, color: LED }}
            >
              {isSubmitting ? "VENDING…" : "VEND"}
            </button>
          </div>
        </div>
      </form>
    </Machine>
  );
}

//one key on the keypad
function Key({
  label,
  onPress,
  active,
  wide,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "rounded border border-white/15 bg-[#232323] py-2 font-mono text-sm text-white/85 transition-colors hover:bg-[#2f2f2f]",
        wide ? "flex-1 px-3 text-xs" : "w-11",
        active && "border-[#7ee787] text-[#7ee787]",
      )}
    >
      {label}
    </button>
  );
}

//the control for one question, sitting in the tray
function Slot({
  field,
  register,
  control,
  invalid,
  autoFocus,
}: {
  field: PublicFormField;
  register: FormTemplateProps["register"];
  control: FormTemplateProps["control"];
  invalid: boolean;
  autoFocus: boolean;
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
          <div className="flex items-center gap-2">
            {[
              { label: "YES", value: true },
              { label: "NO", value: false },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => controlled.onChange(option.value)}
                className={cn(
                  "flex-1 rounded border-2 py-2.5 font-mono text-sm tracking-widest transition-colors",
                  controlled.value === option.value
                    ? "border-[#7ee787] bg-[#7ee787]/15 text-[#7ee787]"
                    : "border-white/15 text-white/70 hover:border-[#7ee787]/50",
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
      autoFocus={autoFocus}
      autoComplete="off"
      aria-label={field.label}
      aria-invalid={invalid}
      className="w-full rounded border-2 bg-black/50 px-3 py-2.5 font-mono text-sm outline-none placeholder:text-white/25"
      style={{ color: LED, borderColor: invalid ? RED : "rgba(255,255,255,0.15)", caretColor: LED }}
    />
  );
}

//the machine chassis the whole thing is bolted into
function Machine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#0b0b0b] px-3 py-8 sm:px-6 sm:py-12">
      <div
        className="h-fit w-full max-w-4xl rounded-2xl p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] sm:p-6"
        style={{ backgroundColor: CHASSIS }}
      >
        {children}
      </div>
    </div>
  );
}
