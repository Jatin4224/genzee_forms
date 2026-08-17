"use client";

import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps } from "./types";

/*
 * A form as an 8-bit RPG conversation. Each question is spoken by an NPC in a
 * dialogue box, typed out a character at a time, and answered from the box below.
 *
 * Colours are a hard-coded night-scene palette, like the other non-Classic
 * templates: this style is always dark whatever theme the app is in.
 */

const PARCHMENT = "#e8e6d9";
const GOLD = "#ffd75e";
const BOX = "#0b0b1e";

//ms per character. slow enough to read as typing, fast enough not to be a wait
const TYPE_SPEED_MS = 26;

//fixed star positions - Math.random during render would differ between the server
//and the client and blow up hydration
const STARS = [
  { left: "8%", top: "12%", size: 3 },
  { left: "18%", top: "28%", size: 2 },
  { left: "27%", top: "8%", size: 2 },
  { left: "39%", top: "20%", size: 3 },
  { left: "52%", top: "10%", size: 2 },
  { left: "61%", top: "26%", size: 3 },
  { left: "73%", top: "14%", size: 2 },
  { left: "84%", top: "24%", size: 3 },
  { left: "92%", top: "9%", size: 2 },
  { left: "45%", top: "34%", size: 2 },
] as const;

//the night scene the dialogue plays out on
function Scene({ children, progress }: { children: React.ReactNode; progress: React.ReactNode }) {
  return (
    <div className="font-pixel relative flex h-svh w-full flex-col overflow-hidden bg-linear-to-b from-[#140d2e] via-[#241546] to-[#3a1f4d] text-[#e8e6d9]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map((star) => (
          <span
            key={`${star.left}-${star.top}`}
            className="absolute bg-[#e8e6d9]/70"
            style={{ left: star.left, top: star.top, width: star.size, height: star.size }}
          />
        ))}
      </div>

      {/* a pixel horizon so the box has ground to sit on */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[#1b1030]"
        style={{ clipPath: "polygon(0 38%,12% 30%,26% 44%,40% 26%,55% 40%,70% 24%,86% 38%,100% 30%,100% 100%,0 100%)" }}
      />

      {progress}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end p-3 sm:p-6">
        {children}
      </div>
    </div>
  );
}

//an hp-style segmented bar, so progress reads as a game stat
function QuestBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="relative z-10 flex shrink-0 items-center gap-3 px-3 pt-3 text-[8px] sm:px-6 sm:pt-6 sm:text-[10px]">
      <span style={{ color: GOLD }}>HP</span>
      <span className="flex flex-1 gap-0.5">
        {Array.from({ length: total }).map((_, index) => (
          <span
            key={index}
            className={cn("h-3 min-w-0 flex-1", index <= step ? "bg-[#6ee06e]" : "bg-[#e8e6d9]/20")}
          />
        ))}
      </span>
      <span className="whitespace-nowrap">
        QUEST {step + 1}/{total}
      </span>
    </div>
  );
}

//the bordered dialogue box: a thick parchment frame with a thin inner rule
function DialogueBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl border-4" style={{ borderColor: PARCHMENT }}>
      <div
        className="border-2 p-4 sm:p-6"
        style={{ borderColor: "rgba(232,230,217,0.35)", backgroundColor: BOX }}
      >
        {children}
      </div>
    </div>
  );
}

export function QuestTemplate({
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

  const [step, setStep] = useState(0);
  //how much of the current question has been "spoken" so far
  const [typed, setTyped] = useState(0);

  //the y/n menu answers and advances through the form's own submit, so there is
  //a single advance path
  const formRef = useRef<HTMLFormElement>(null);

  //a step past the end can only happen if the form's fields change mid-fill
  const field = form.fields[Math.min(step, Math.max(total - 1, 0))];
  const spoken = field?.label ?? "";

  //type the question out. the preview has no timers - it shows the finished line,
  //or the gallery card would catch it mid-word
  useEffect(() => {
    if (isPreview) {
      setTyped(spoken.length);
      return;
    }

    setTyped(0);

    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      setTyped(count);
      if (count >= spoken.length) clearInterval(timer);
    }, TYPE_SPEED_MS);

    return () => clearInterval(timer);
  }, [spoken, isPreview]);

  const isDoneTyping = typed >= spoken.length;

  if (isSuccess || total === 0) {
    return (
      <Scene progress={null}>
        <DialogueBox>
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <p className="text-lg sm:text-2xl" style={{ color: GOLD }}>
              {total === 0 ? "NO QUESTS" : "QUEST COMPLETE!"}
            </p>
            <p aria-hidden className="text-xl tracking-[0.3em]" style={{ color: GOLD }}>
              ★ ★ ★
            </p>
            <p className="text-[10px] leading-relaxed sm:text-xs">
              {total === 0
                ? "This form has no questions yet."
                : "Your response has been recorded."}
            </p>
          </div>
        </DialogueBox>
      </Scene>
    );
  }

  if (!field) return null;

  const { helperText } = parseFieldDescription(field.description);
  const errorMessage = errors[field.labelKey]?.message as string | undefined;
  const isLast = step === total - 1;

  //one handler for Enter, the confirm button and the yes/no menu: validate what is
  //on screen, then advance or submit the whole quest
  const onNext: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (isPreview) return;

    //the NPC is still speaking; the first press finishes the line rather than
    //answering, the way skipping dialogue works in a game
    if (!isDoneTyping) {
      setTyped(spoken.length);
      return;
    }

    const isValid = await trigger(field.labelKey);
    if (!isValid) return;

    if (isLast) {
      try {
        await onSubmit(event);
      } catch {
        //useSubmitForm already toasts the failure; swallowing it keeps the rejection
        //from escaping and leaves the quest on the last question
      }
      return;
    }

    setStep((current) => current + 1);
  };

  return (
    <Scene progress={<QuestBar step={step} total={total} />}>
      <form ref={formRef} onSubmit={onNext} noValidate className="flex flex-col gap-3">
        {/* the speaker plate, overlapping the box the way a name tag does */}
        <div className="mx-auto w-full max-w-3xl">
          <span
            className="ml-2 inline-block border-4 px-3 py-1.5 text-[9px] sm:text-[11px]"
            style={{ borderColor: PARCHMENT, backgroundColor: BOX, color: GOLD }}
          >
            {form.title.toUpperCase()}
          </span>
        </div>

        <DialogueBox>
          {/* clicking the box finishes the line, like tapping through game dialogue */}
          <div
            onClick={() => !isPreview && !isDoneTyping && setTyped(spoken.length)}
            className="max-h-[28svh] overflow-y-auto text-[11px] leading-[2] wrap-break-word sm:text-sm sm:leading-[2.2]"
          >
            <p>
              {spoken.slice(0, typed)}
              {field.isRequired && isDoneTyping && <span style={{ color: GOLD }}> *</span>}
              {/* the blinking marker a game shows once a line has finished */}
              {isDoneTyping && (
                <span aria-hidden className="ml-2 animate-pulse" style={{ color: GOLD }}>
                  ▼
                </span>
              )}
            </p>

            {helperText && isDoneTyping && (
              <p className="mt-3 text-[9px] leading-[2] text-[#e8e6d9]/60 sm:text-[11px]">
                {helperText}
              </p>
            )}
          </div>

          {/* the answer only opens up once the NPC has stopped talking */}
          {isDoneTyping && (
            //keyed on the field so the control remounts and re-focuses each question
            <div key={field.id} className="mt-5 border-t-2 border-[#e8e6d9]/25 pt-4">
              {field.type === "YES_NO" ? (
                <Controller
                  control={control}
                  name={field.labelKey}
                  //null, not false: false is a real answer ("NO"), so it cannot double
                  //as "not answered yet" - see getFieldRules
                  defaultValue={null}
                  rules={getFieldRules(field)}
                  render={({ field: controlled }) => (
                    <div className="flex flex-col gap-2 text-[11px] sm:text-sm">
                      {[
                        { label: "YES", value: true },
                        { label: "NO", value: false },
                      ].map((option) => {
                        const selected = controlled.value === option.value;

                        return (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => {
                              controlled.onChange(option.value);
                              //react-hook-form's store updates synchronously, so the
                              //validation on submit already sees this answer
                              formRef.current?.requestSubmit();
                            }}
                            className="flex items-center gap-3 text-left transition-colors hover:text-[#ffd75e]"
                          >
                            {/* the pointer a game menu puts beside the active row */}
                            <span
                              aria-hidden
                              className={cn(selected ? "opacity-100" : "opacity-0")}
                              style={{ color: GOLD }}
                            >
                              ▶
                            </span>
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <span aria-hidden style={{ color: GOLD }}>
                    ▶
                  </span>
                  <input
                    {...register(field.labelKey, getFieldRules(field))}
                    id={field.id}
                    type={getInputType(field)}
                    placeholder={field.placeholder ?? ""}
                    autoFocus={!isPreview}
                    autoComplete="off"
                    aria-label={field.label}
                    aria-invalid={!!errorMessage}
                    className="font-pixel min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#e8e6d9]/30 sm:text-sm"
                    style={{ color: PARCHMENT, caretColor: GOLD }}
                  />
                </div>
              )}

              {errorMessage && (
                <p className="mt-3 text-[9px] leading-relaxed sm:text-[11px]" style={{ color: "#ff6b6b" }}>
                  ! {errorMessage}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-4 text-[9px] sm:text-[11px]">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => Math.max(current - 1, 0))}
                    className="text-[#e8e6d9]/60 transition-colors hover:text-[#e8e6d9]"
                  >
                    ◀ BACK
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border-2 px-4 py-2 transition-colors hover:bg-[#ffd75e]/15 disabled:opacity-50"
                  style={{ borderColor: GOLD, color: GOLD }}
                >
                  {isLast ? (isSubmitting ? "SAVING…" : "FINISH") : "NEXT ▶"}
                </button>
              </div>
            </div>
          )}
        </DialogueBox>
      </form>
    </Scene>
  );
}
