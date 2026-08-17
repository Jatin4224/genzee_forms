"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useWatch } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as an airport split-flap board. The current question clatters into place
 * a character at a time, questions already answered stay listed above it like
 * earlier departures, and the answer is typed on the board itself.
 *
 * Hard-coded amber-on-black, like the other non-Classic templates: this style is
 * always dark whatever theme the app is in.
 */

const AMBER = "#ffb000";
const DIM = "#6b4a00";

//the characters a flap cycles through before it settles
const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

//ms per flap tick. two ticks per character, so each one visibly scrambles first
const FLAP_MS = 38;

//useWatch needs a name; this stands in when nothing is answered yet so the hook
//never falls back to subscribing to the whole form
const NO_FIELDS = "__departures_no_history__";

//a board only has room for so much - a very long question is cut rather than
//wrapping into a wall of flaps
const MAX_FLAPS = 48;

function boardText(label: string) {
  const text = label.toUpperCase();

  return text.length > MAX_FLAPS ? `${text.slice(0, MAX_FLAPS - 1)}…` : text;
}

//how an answer reads once it is up on the board
function boardAnswer(field: PublicFormField, value: unknown) {
  if (field.type === "YES_NO") return value ? "YES" : "NO";

  const text = String(value ?? "").trim();

  //the board stays on screen for the rest of the fill, so a password must not
  if (field.type === "PASSWORD") return "•".repeat(text.length);

  return text.toUpperCase();
}

//one flap in the board: a split tile that shows a character
function Flap({ char, settled }: { char: string; settled: boolean }) {
  return (
    <span
      className={cn(
        "relative grid h-7 w-5 shrink-0 place-items-center rounded-[2px] bg-[#161616] font-mono text-sm leading-none sm:h-8 sm:w-6 sm:text-base",
        settled ? "text-[#ffb000]" : "text-[#ffb000]/45",
      )}
    >
      {char === " " ? "" : char}
      {/* the seam the two halves of a real flap meet on */}
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-black/70" />
    </span>
  );
}

export function DeparturesTemplate({
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

  const [step, setStep] = useState(() => (isPreview ? Math.min(1, Math.max(total - 1, 0)) : 0));
  //ticks of the flap mechanism for the question currently coming up
  const [tick, setTick] = useState(0);

  //the yes/no options answer and advance through the form's own submit, so there
  //is a single advance path
  const formRef = useRef<HTMLFormElement>(null);

  //a step past the end can only happen if the form's fields change mid-fill
  const field = form.fields[Math.min(step, Math.max(total - 1, 0))];
  const label = boardText(field?.label ?? "");

  const answered = form.fields.slice(0, step);
  //subscribe only to what is already answered - the live answer is read from its
  //own input, so typing never re-renders the rows above
  const historyValues = useWatch({
    control,
    name: answered.length ? answered.map((entry) => entry.labelKey) : [NO_FIELDS],
  });

  //run the flaps for the current question. the preview shows a settled board -
  //timers there would catch the gallery card mid-clatter
  useEffect(() => {
    if (isPreview) {
      setTick(label.length * 2);
      return;
    }

    setTick(0);

    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      setTick(count);
      if (count >= label.length * 2) clearInterval(timer);
    }, FLAP_MS);

    return () => clearInterval(timer);
  }, [label, isPreview]);

  const settledCount = Math.floor(tick / 2);
  const isSettled = settledCount >= label.length;

  if (isSuccess || total === 0) {
    return (
      <Board title={form.title} status={total === 0 ? "NO DEPARTURES" : "BOARDED"}>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex flex-wrap justify-center gap-0.5">
            {(total === 0 ? "NOTHING TO ASK" : "THANK YOU").split("").map((char, index) => (
              <Flap key={index} char={char} settled />
            ))}
          </div>
          <p className="font-mono text-xs" style={{ color: DIM }}>
            {total === 0
              ? "this form has no questions yet"
              : "your response has been recorded"}
          </p>
        </div>
      </Board>
    );
  }

  if (!field) return null;

  const { helperText } = parseFieldDescription(field.description);
  const errorMessage = errors[field.labelKey]?.message as string | undefined;
  const isLast = step === total - 1;

  //one handler for Enter, the board button and the yes/no options: validate what
  //is on the board, then advance or submit the whole form
  const onNext: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (isPreview) return;

    //the flaps are still turning; the first press settles them rather than
    //answering a question that is not fully up yet
    if (!isSettled) {
      setTick(label.length * 2);
      return;
    }

    const isValid = await trigger(field.labelKey);
    if (!isValid) return;

    if (isLast) {
      try {
        await onSubmit(event);
      } catch {
        //useSubmitForm already toasts the failure; swallowing it keeps the
        //rejection from escaping and leaves the board on the last question
      }
      return;
    }

    setStep((current) => current + 1);
  };

  return (
    <Board title={form.title} status={`GATE ${step + 1}/${total}`}>
      <form ref={formRef} onSubmit={onNext} noValidate className="flex flex-col gap-5">
        {/* earlier questions stay listed, the way a board keeps the departures
            that have already gone */}
        {answered.length > 0 && (
          <ul className="flex flex-col gap-1 font-mono text-[11px] sm:text-xs">
            {answered.map((entry, index) => (
              <li key={entry.id} className="flex items-baseline gap-3">
                <span className="min-w-0 flex-1 truncate" style={{ color: DIM }}>
                  {boardText(entry.label)}
                </span>
                <span className="shrink-0 truncate" style={{ color: AMBER }}>
                  {/* nothing is typed in a preview, so the author's own example
                      answer stands in rather than showing an empty row */}
                  {isPreview
                    ? (entry.placeholder ?? "OK").toUpperCase()
                    : boardAnswer(entry, historyValues[index])}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-white/10 pt-5">
          <label
            htmlFor={field.type === "YES_NO" ? undefined : field.id}
            className="mb-2 block font-mono text-[10px] tracking-[0.3em]"
            style={{ color: DIM }}
          >
            NOW BOARDING
          </label>

          {/* the question itself, clattering into place */}
          <div className="flex flex-wrap gap-0.5" aria-label={field.label}>
            {label.split("").map((char, index) => {
              const settled = index < settledCount;
              const scrambling = index === settledCount && !isSettled;

              return (
                <Flap
                  key={index}
                  settled={settled}
                  char={
                    settled
                      ? char
                      : scrambling
                        ? FLAP_CHARS[tick % FLAP_CHARS.length]!
                        : " "
                  }
                />
              );
            })}
            {field.isRequired && isSettled && (
              <span className="ml-1 self-center font-mono text-sm" style={{ color: AMBER }}>
                *
              </span>
            )}
          </div>

          {helperText && isSettled && (
            <p className="mt-3 font-mono text-[11px] wrap-break-word" style={{ color: DIM }}>
              {helperText}
            </p>
          )}
        </div>

        {/* the answer only opens once the board has finished turning */}
        {isSettled && (
          //keyed on the field so the control remounts and re-focuses each question
          <div key={field.id} className="flex flex-col gap-3">
            {field.type === "YES_NO" ? (
              <Controller
                control={control}
                name={field.labelKey}
                //null, not false: false is a real answer ("NO"), so it cannot double
                //as "not answered yet" - see getFieldRules
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
                        onClick={() => {
                          controlled.onChange(option.value);
                          //react-hook-form's store updates synchronously, so the
                          //validation on submit already sees this answer
                          formRef.current?.requestSubmit();
                        }}
                        className={cn(
                          "flex-1 rounded-[2px] border px-4 py-2.5 font-mono text-sm tracking-widest transition-colors",
                          controlled.value === option.value
                            ? "border-[#ffb000] bg-[#ffb000]/15 text-[#ffb000]"
                            : "border-white/15 text-white/70 hover:border-[#ffb000]/60 hover:text-[#ffb000]",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            ) : (
              <div className="flex items-center gap-3 border-b border-white/15 pb-2">
                <span aria-hidden className="font-mono text-sm" style={{ color: AMBER }}>
                  ▸
                </span>
                <input
                  {...register(field.labelKey, getFieldRules(field))}
                  id={field.id}
                  type={getInputType(field)}
                  placeholder={field.placeholder ?? ""}
                  autoFocus={!isPreview}
                  autoComplete="off"
                  aria-invalid={!!errorMessage}
                  className="min-w-0 flex-1 bg-transparent font-mono text-base tracking-wide outline-none placeholder:text-white/25"
                  style={{ color: AMBER, caretColor: AMBER }}
                />
              </div>
            )}

            {errorMessage && (
              <p className="font-mono text-[11px] wrap-break-word" style={{ color: "#ff6b6b" }}>
                ⚠ {errorMessage}
              </p>
            )}

            <div className="flex items-center justify-between gap-4 pt-1">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => Math.max(current - 1, 0))}
                  className="font-mono text-[11px] tracking-widest text-white/40 transition-colors hover:text-white"
                >
                  ◂ PREV
                </button>
              ) : (
                <span />
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[2px] border border-[#ffb000]/60 bg-[#ffb000]/10 px-5 py-2 font-mono text-sm tracking-widest text-[#ffb000] transition-colors hover:bg-[#ffb000]/20 disabled:opacity-50"
              >
                {isLast ? (isSubmitting ? "SENDING" : "DEPART") : "NEXT ▸"}
              </button>
            </div>
          </div>
        )}
      </form>
    </Board>
  );
}

//the board housing: a dark case with a lit header strip
function Board({
  title,
  status,
  children,
}: {
  title: string;
  status: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#050505] px-3 py-8 sm:px-6 sm:py-14">
      <div className="h-fit w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-[0_20px_60px_-24px_rgba(255,176,0,0.25)]">
        <header className="flex items-center gap-3 border-b border-white/10 bg-[#111] px-4 py-3 sm:px-6">
          <p
            className="font-mono text-xs tracking-[0.3em] sm:text-sm"
            style={{ color: AMBER }}
          >
            DEPARTURES
          </p>
          <p className="min-w-0 flex-1 truncate text-center font-mono text-[11px] text-white/50">
            {title.toUpperCase()}
          </p>
          <p className="shrink-0 font-mono text-[11px] tracking-widest" style={{ color: AMBER }}>
            {status}
          </p>
        </header>

        <div className="px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
