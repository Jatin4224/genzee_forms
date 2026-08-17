"use client";

import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as a comic strip: every question is a panel, asked from a speech bubble
 * and answered in the panel below it. Like Classic and Paper it shows the whole
 * form at once - a page of comics is meant to be read as a page.
 *
 * Hard-coded ink-on-newsprint colours, so it looks the same in either theme. It
 * is the one bright template, which is the point of it.
 */

const INK = "#12100e";

//the fill behind each panel, cycled by index so neighbouring panels differ
const PANEL_COLOURS = ["#ffd93d", "#4ecdc4", "#ff6b9d", "#ff9f43", "#a8e063", "#b892ff"] as const;

//benday dots, the print texture a comic is made of
const HALFTONE = {
  backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.16) 1.5px, transparent 1.6px)",
  backgroundSize: "8px 8px",
} as const;

//every panel edge in the layout, so the strip reads as inked artwork
const PANEL_BORDER = "border-[3px] border-[#12100e]";

function panelColour(index: number) {
  return PANEL_COLOURS[index % PANEL_COLOURS.length]!;
}

//a slight rotation per panel so the page looks laid out by hand rather than by a
//grid. deterministic - a random tilt would differ between server and client
function tiltFor(index: number) {
  return [-1.1, 0.8, -0.6, 1.2, -0.9, 0.5][index % 6]!;
}

//the question, in a bubble with a tail pointing down into the panel
function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className={cn("rounded-[18px] bg-white px-4 py-3", PANEL_BORDER)}>
        <p className="font-comic text-xl leading-tight wrap-break-word sm:text-2xl">{children}</p>
      </div>
      {/* the tail: an outlined square rotated to a diamond, with its top-left
          edges inked so only the two outer sides read as the bubble's outline */}
      <span
        aria-hidden
        className="absolute -bottom-2 left-8 size-4 rotate-45 border-r-[3px] border-b-[3px] border-[#12100e] bg-white"
      />
    </div>
  );
}

//the answer control. text-like types get a boxed caption, yes/no gets the two
//shouted options a comic would letter as a burst
function Answer({
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
        //null, not false: false is a real answer ("NO!"), so it cannot double as
        //"not answered yet" - see getFieldRules
        defaultValue={null}
        rules={getFieldRules(field)}
        render={({ field: controlled }) => (
          <div className="flex items-center gap-3">
            {[
              { label: "YES!", value: true },
              { label: "NO!", value: false },
            ].map((option) => {
              const selected = controlled.value === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => controlled.onChange(option.value)}
                  aria-pressed={selected}
                  className={cn(
                    "font-comic flex-1 rounded-lg px-4 py-2.5 text-xl transition-transform",
                    PANEL_BORDER,
                    selected
                      ? "-rotate-2 scale-105 bg-[#12100e] text-white"
                      : "bg-white text-[#12100e] hover:-rotate-1",
                    invalid && !selected && "border-[#d62828]",
                  )}
                >
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
      //handwriting in the caption box, the way a letterer fills one in
      className={cn(
        "font-hand w-full rounded-lg bg-white px-3 py-2 text-2xl outline-none placeholder:font-sans placeholder:text-sm placeholder:text-black/35",
        PANEL_BORDER,
        invalid && "border-[#d62828]",
      )}
      style={{ color: "#1d3f8f" }}
    />
  );
}

export function ComicTemplate({
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
      <div className="min-h-svh w-full bg-[#f3ead6] px-4 py-10" style={{ color: INK }}>
        <div style={HALFTONE} className="absolute inset-0 -z-10" aria-hidden />
        <div
          className={cn(
            "mx-auto flex max-w-lg -rotate-1 flex-col items-center gap-4 rounded-xl bg-[#ffd93d] px-8 py-14 text-center",
            PANEL_BORDER,
          )}
        >
          <p className="font-comic text-5xl sm:text-6xl">THE END!</p>
          <p className="font-comic text-xl">Your response has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-svh w-full bg-[#f3ead6] px-4 py-8 sm:px-6 sm:py-12" style={{ color: INK }}>
      <div style={HALFTONE} className="pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto w-full max-w-4xl">
        {/* the title, lettered on a banner across the top of the page */}
        <header className="mb-8 flex flex-col items-center gap-3 text-center">
          <h1
            className={cn(
              "font-comic -rotate-1 rounded-xl bg-[#ff3b3b] px-6 py-3 text-3xl text-white wrap-break-word sm:text-5xl",
              PANEL_BORDER,
            )}
            style={{ textShadow: "3px 3px 0 #12100e" }}
          >
            {form.title}
          </h1>
          {form.description && (
            <p className="font-comic max-w-xl text-lg wrap-break-word sm:text-xl">
              {form.description}
            </p>
          )}
        </header>

        {/* noValidate for the same reason as the other templates: the browser's own
            tooltip on an `email` input blocks submit with no submit event */}
        <form onSubmit={onSubmit} noValidate>
          {form.fields.length === 0 && (
            <p
              className={cn(
                "font-comic mx-auto max-w-md rounded-xl bg-white px-6 py-8 text-center text-2xl",
                PANEL_BORDER,
              )}
            >
              No panels drawn yet!
            </p>
          )}

          <ol className="grid gap-6 sm:grid-cols-2">
            {form.fields.map((field, index) => {
              const errorMessage = errors[field.labelKey]?.message as string | undefined;
              const { helperText } = parseFieldDescription(field.description);

              return (
                <li
                  key={field.id}
                  className={cn("relative rounded-xl p-4 sm:p-5", PANEL_BORDER)}
                  style={{
                    backgroundColor: panelColour(index),
                    transform: `rotate(${tiltFor(index)}deg)`,
                  }}
                >
                  <div style={HALFTONE} className="pointer-events-none absolute inset-0 rounded-lg" aria-hidden />

                  <div className="relative flex flex-col gap-5">
                    {/* the panel number, boxed in the corner like a caption */}
                    <span
                      className={cn(
                        "font-comic absolute -top-1 -right-1 grid size-8 place-items-center rounded-md bg-white text-lg",
                        PANEL_BORDER,
                      )}
                    >
                      {index + 1}
                    </span>

                    <label htmlFor={field.type === "YES_NO" ? undefined : field.id}>
                      <SpeechBubble>
                        {field.label}
                        {field.isRequired && <span className="text-[#d62828]"> *</span>}
                      </SpeechBubble>
                    </label>

                    <div className="flex flex-col gap-2">
                      {helperText && (
                        <p className="font-comic text-base wrap-break-word">{helperText}</p>
                      )}

                      <Answer
                        field={field}
                        register={register}
                        control={control}
                        invalid={!!errorMessage}
                      />

                      {errorMessage && (
                        <p
                          className={cn(
                            "font-comic rounded-md bg-[#d62828] px-2 py-1 text-base text-white",
                            PANEL_BORDER,
                          )}
                        >
                          {errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "font-comic -rotate-2 rounded-xl bg-[#ffd93d] px-10 py-4 text-3xl transition-transform hover:rotate-0 hover:scale-105 disabled:opacity-60",
                PANEL_BORDER,
              )}
              style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.25)" }}
            >
              {isSubmitting ? "SENDING…" : "SEND IT!"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
