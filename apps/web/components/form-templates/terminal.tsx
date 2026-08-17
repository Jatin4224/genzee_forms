"use client";

import { useRef, useState } from "react";
import { Controller, useWatch } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as a command-line session. Answered questions stay in the scrollback as
 * echoed prompt lines, the current question is the live prompt, and Enter moves
 * on - the way an interactive CLI asks for input.
 *
 * Colours are a hard-coded dark terminal palette, like the other non-Classic
 * templates: this style is always dark whatever theme the app is in.
 */

const GREEN = "#7ee787";
const CYAN = "#79c0ff";
const DIM = "#8b949e";
const RED = "#ff7b72";

//useWatch needs a name; this stands in when nothing has been answered yet so the
//hook never falls back to subscribing to the whole form
const NO_FIELDS = "__terminal_no_history__";

//how an answer is echoed back into the scrollback
function echoAnswer(field: PublicFormField, value: unknown) {
  if (field.type === "YES_NO") return value ? "y" : "n";

  const text = String(value ?? "").trim();

  //the session stays on screen for the rest of the fill, so a password must not
  if (field.type === "PASSWORD") return "*".repeat(text.length);

  return text;
}

//lowercased, spaces to dashes - a question rendered as a cli flag name
function flagName(label: string) {
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "answer"
  );
}

//the window the session runs in
function Terminal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#010409] px-3 py-6 sm:px-6 sm:py-10">
      <div className="flex h-[calc(100svh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] font-mono shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] sm:h-[calc(100svh-5rem)]">
        <div className="flex shrink-0 items-center gap-2 border-b border-white/8 bg-[#161b22] px-4 py-2.5">
          <span aria-hidden className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
          </span>
          <p className="min-w-0 flex-1 truncate text-center text-xs text-[#8b949e]">
            {title} — zsh
          </p>
          {/* balances the traffic lights so the title stays optically centred */}
          <span aria-hidden className="w-13.5" />
        </div>

        {children}
      </div>
    </div>
  );
}

//a blinking block, used where there is no real input to carry a caret
function Cursor() {
  return (
    <span aria-hidden className="ml-0.5 inline-block animate-pulse" style={{ color: GREEN }}>
      █
    </span>
  );
}

export function TerminalTemplate({
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

  //the preview opens partway in so the scrollback has something to show
  const [step, setStep] = useState(() => (isPreview ? Math.min(1, Math.max(total - 1, 0)) : 0));

  //quick replies go through the form's own submit, so there is one advance path
  const formRef = useRef<HTMLFormElement>(null);

  const answered = form.fields.slice(0, step);
  //subscribe only to what is already answered: the live question is read from its
  //own input, so this never re-renders the scrollback on every keystroke
  //always an array, so useWatch resolves to the same overload on every render
  const historyValues = useWatch({
    control,
    name: answered.length ? answered.map((entry) => entry.labelKey) : [NO_FIELDS],
  });

  //a step past the end can only happen if the form's fields change mid-fill
  const field = form.fields[Math.min(step, Math.max(total - 1, 0))];
  const errorMessage = field ? (errors[field.labelKey]?.message as string | undefined) : undefined;
  const isLast = step === total - 1;

  //one handler for Enter, the run button and the y/n tokens: validate what is on
  //the prompt, then advance or submit the whole form
  const onNext: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (isPreview || !field) return;

    const isValid = await trigger(field.labelKey);
    if (!isValid) return;

    if (isLast) {
      try {
        await onSubmit(event);
      } catch {
        //useSubmitForm already toasts the failure; swallowing it keeps the rejection
        //from escaping and leaves the session on the last prompt
      }
      return;
    }

    setStep((current) => current + 1);
  };

  return (
    <Terminal title={form.title}>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-[13px] leading-relaxed sm:px-5 sm:text-sm">
        {/* the boot preamble, so the session starts mid-flow like a real script */}
        <p style={{ color: DIM }}>
          <span style={{ color: GREEN }}>$</span> ./genzee --form &quot;{form.title}&quot;
        </p>
        <p style={{ color: DIM }}>
          <span style={{ color: GREEN }}>✓</span> connected
        </p>
        <p style={{ color: DIM }}>
          <span style={{ color: GREEN }}>✓</span> loaded {total} question{total === 1 ? "" : "s"}
        </p>
        {form.description && (
          <p className="mt-1 wrap-break-word" style={{ color: DIM }}>
            # {form.description}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-1">
          {/* the scrollback: every question already answered, echoed back */}
          {answered.map((entry, index) => (
            <p key={entry.id} className="wrap-break-word" style={{ color: DIM }}>
              <span style={{ color: GREEN }}>?</span> --{flagName(entry.label)}{" "}
              <span style={{ color: CYAN }}>
                {/* nothing is typed in a preview, so the author's own example answer
                    stands in rather than echoing an empty line */}
                {isPreview
                  ? (entry.placeholder ?? "ok")
                  : echoAnswer(entry, historyValues[index])}
              </span>
            </p>
          ))}

          {total === 0 && (
            <p style={{ color: DIM }}>
              <span style={{ color: RED }}>!</span> no questions defined for this form
            </p>
          )}

          {isSuccess && (
            <>
              <p className="mt-2" style={{ color: GREEN }}>
                ✓ response recorded
              </p>
              <p style={{ color: DIM }}>
                <span style={{ color: GREEN }}>$</span>
                <Cursor />
              </p>
            </>
          )}
        </div>
      </div>

      {field && !isSuccess && (
        <form
          ref={formRef}
          onSubmit={onNext}
          //the browser's own tooltip on an `email` input would block submit with no
          //submit event, freezing the session. react-hook-form owns validation here
          noValidate
          className="shrink-0 border-t border-white/8 bg-[#0d1117] px-4 py-4 text-[13px] sm:px-5 sm:text-sm"
        >
          <label htmlFor={field.id} className="block wrap-break-word" style={{ color: "#c9d1d9" }}>
            <span style={{ color: GREEN }}>?</span> {field.label}
            {field.isRequired && <span style={{ color: RED }}> *</span>}
          </label>

          {(() => {
            const { helperText } = parseFieldDescription(field.description);

            return (
              helperText && (
                <p className="mt-0.5 wrap-break-word" style={{ color: DIM }}>
                  # {helperText}
                </p>
              )
            );
          })()}

          {/* keyed on the field so the control remounts and re-focuses each prompt */}
          <div key={field.id} className="mt-2">
            {field.type === "YES_NO" ? (
              <Controller
                control={control}
                name={field.labelKey}
                //null, not false: false is a real answer ("n"), so it cannot double
                //as "not answered yet" - see getFieldRules
                defaultValue={null}
                rules={getFieldRules(field)}
                render={({ field: controlled }) => (
                  <div className="flex items-center gap-3">
                    <span style={{ color: DIM }}>(y/n)</span>
                    {[
                      { key: "y", label: "yes", value: true },
                      { key: "n", label: "no", value: false },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          controlled.onChange(option.value);
                          //react-hook-form's store updates synchronously, so the
                          //validation on submit already sees this answer
                          formRef.current?.requestSubmit();
                        }}
                        className={cn(
                          "rounded border px-2.5 py-1 transition-colors",
                          controlled.value === option.value
                            ? "border-[#7ee787] bg-[#7ee787]/15 text-[#7ee787]"
                            : "border-white/15 text-[#c9d1d9] hover:border-[#7ee787]/60 hover:text-[#7ee787]",
                        )}
                      >
                        [{option.key}] {option.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            ) : (
              <div className="flex items-baseline gap-2">
                <span aria-hidden style={{ color: GREEN }}>
                  ›
                </span>
                <input
                  {...register(field.labelKey, getFieldRules(field))}
                  id={field.id}
                  type={getInputType(field)}
                  placeholder={field.placeholder ?? ""}
                  autoFocus={!isPreview}
                  autoComplete="off"
                  aria-invalid={!!errorMessage}
                  //the native caret is the cursor: it blinks and it is always in the
                  //right place, which a faked block cursor after the text is not
                  className="min-w-0 flex-1 bg-transparent font-mono outline-none placeholder:text-[#8b949e]/50"
                  style={{ color: CYAN, caretColor: GREEN }}
                />
              </div>
            )}
          </div>

          {errorMessage && (
            <p className="mt-2 wrap-break-word" style={{ color: RED }}>
              ✗ {errorMessage}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3" style={{ color: DIM }}>
              <span className="tabular-nums">
                [{step + 1}/{total}]
              </span>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((current) => Math.max(current - 1, 0))}
                  className="transition-colors hover:text-[#c9d1d9]"
                >
                  ^C back
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded border border-[#7ee787]/50 bg-[#7ee787]/10 px-4 py-1.5 text-[#7ee787] transition-colors hover:bg-[#7ee787]/20 disabled:opacity-50"
            >
              {isLast ? (isSubmitting ? "submitting…" : "submit ⏎") : "next ⏎"}
            </button>
          </div>
        </form>
      )}
    </Terminal>
  );
}
