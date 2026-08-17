"use client";

import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as a wall of sticky notes. Every question is pinned up on its own note
 * and answered in handwriting. Like Classic, Paper, Comic and Spreadsheet it
 * shows the whole form at once - a board is meant to be taken in at a glance.
 *
 * Hard-coded cork-and-paper colours, so it looks the same in either theme.
 */

const INK = "#2b2b2b";
//the same blue biro the Paper template writes with
const PEN = "#1d3f8f";

//note colours, cycled by index so neighbouring notes differ
const NOTE_COLOURS = ["#fff59d", "#f8bbd0", "#c5e1a5", "#b3e5fc", "#ffcc80", "#d1c4e9"] as const;

//pin colours, cycled on a different length to the notes so the pairing varies
const PIN_COLOURS = ["#e53935", "#1e88e5", "#43a047", "#fb8c00", "#8e24aa"] as const;

//a hand-pinned board is never square. deterministic - a random tilt would differ
//between the server render and the client and break hydration
const TILTS = [-2.4, 1.8, -1.2, 2.6, -1.9, 1.1, -2.8, 2.1] as const;

//flecked cork, built from a couple of tiled gradients
const CORK = {
  backgroundColor: "#b98a5b",
  backgroundImage: [
    "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.12) 0 2px, transparent 3px)",
    "radial-gradient(circle at 70% 65%, rgba(255,255,255,0.10) 0 2px, transparent 3px)",
    "radial-gradient(circle at 45% 80%, rgba(0,0,0,0.08) 0 1.5px, transparent 2.5px)",
  ].join(","),
  backgroundSize: "26px 26px, 34px 34px, 19px 19px",
} as const;

function noteColour(index: number) {
  return NOTE_COLOURS[index % NOTE_COLOURS.length]!;
}

//the pin that holds a note to the board
function Pin({ index }: { index: number }) {
  const colour = PIN_COLOURS[index % PIN_COLOURS.length]!;

  return (
    <span
      aria-hidden
      className="absolute -top-2.5 left-1/2 size-5 -translate-x-1/2 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.35)]"
      style={{ backgroundColor: colour }}
    >
      {/* the highlight that makes the head read as domed rather than flat */}
      <span className="absolute top-1 left-1 size-1.5 rounded-full bg-white/60" />
    </span>
  );
}

//a single note. the tilt and colour come from its position on the board
function Note({
  index,
  children,
  className,
}: {
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative px-4 pt-6 pb-4 shadow-[3px_5px_10px_rgba(0,0,0,0.28)]", className)}
      style={{
        backgroundColor: noteColour(index),
        transform: `rotate(${TILTS[index % TILTS.length]}deg)`,
      }}
    >
      <Pin index={index} />
      {children}
    </div>
  );
}

//the answer written on the note. text-like types get a ruled line, yes/no gets
//the two options circled the way someone would ring one by hand
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
        //null, not false: false is a real answer ("No"), so it cannot double as
        //"not answered yet" - see getFieldRules
        defaultValue={null}
        rules={getFieldRules(field)}
        render={({ field: controlled }) => (
          <div className="flex items-center gap-3">
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
                  className={cn(
                    "font-hand rounded-full px-4 py-1 text-2xl transition-colors",
                    //the ring reads as a circle drawn round the chosen answer
                    selected ? "border-2" : "border-2 border-transparent hover:border-black/15",
                  )}
                  style={{
                    color: PEN,
                    borderColor: selected ? PEN : undefined,
                  }}
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
      //written straight onto the note: no box, just the ruled line under the words
      className="font-hand w-full border-b-2 bg-transparent pb-1 text-2xl outline-none placeholder:font-sans placeholder:text-sm placeholder:text-black/30"
      style={{ color: PEN, borderColor: invalid ? "#c0392b" : "rgba(0,0,0,0.25)" }}
    />
  );
}

export function CorkboardTemplate({
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
      <div className="grid min-h-svh w-full place-items-center px-4 py-10" style={CORK}>
        <div className="w-full max-w-xs">
          <Note index={0} className="text-center">
            <p className="font-hand text-4xl" style={{ color: INK }}>
              Thanks!
            </p>
            <p className="font-hand mt-2 text-xl" style={{ color: INK, opacity: 0.7 }}>
              Your response has been recorded.
            </p>
          </Note>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full px-4 py-10 sm:px-8 sm:py-14" style={CORK}>
      <div className="mx-auto w-full max-w-5xl">
        {/* the title, pinned up like a label at the top of the board */}
        <header className="mb-10 flex justify-center">
          <div className="w-full max-w-md">
            <Note index={3} className="text-center">
              <h1 className="font-hand text-3xl wrap-break-word sm:text-4xl" style={{ color: INK }}>
                {form.title}
              </h1>
              {form.description && (
                <p
                  className="font-hand mt-1 text-xl wrap-break-word"
                  style={{ color: INK, opacity: 0.7 }}
                >
                  {form.description}
                </p>
              )}
            </Note>
          </div>
        </header>

        {/* noValidate for the same reason as the other templates: the browser's own
            tooltip on an `email` input blocks submit with no submit event */}
        <form onSubmit={onSubmit} noValidate>
          {form.fields.length === 0 && (
            <div className="mx-auto w-full max-w-xs">
              <Note index={1} className="text-center">
                <p className="font-hand text-2xl" style={{ color: INK }}>
                  Nothing pinned up yet.
                </p>
              </Note>
            </div>
          )}

          {/* columns rather than a grid: notes are different heights, and a masonry
              flow keeps the board from leaving a row of gaps under the short ones */}
          <ol className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {form.fields.map((field, index) => {
              const errorMessage = errors[field.labelKey]?.message as string | undefined;
              const { helperText } = parseFieldDescription(field.description);

              return (
                <li key={field.id} className="mb-8 break-inside-avoid">
                  <Note index={index}>
                    <label
                      htmlFor={field.type === "YES_NO" ? undefined : field.id}
                      className="font-hand block text-2xl leading-snug wrap-break-word"
                      style={{ color: INK }}
                    >
                      {field.label}
                      {field.isRequired && <span className="text-[#c0392b]"> *</span>}
                    </label>

                    {helperText && (
                      <p
                        className="font-hand mt-1 text-lg leading-snug wrap-break-word"
                        style={{ color: INK, opacity: 0.65 }}
                      >
                        {helperText}
                      </p>
                    )}

                    <div className="mt-4">
                      <Answer
                        field={field}
                        register={register}
                        control={control}
                        invalid={!!errorMessage}
                      />
                    </div>

                    {errorMessage && (
                      <p className="font-hand mt-1.5 text-lg wrap-break-word text-[#c0392b]">
                        {errorMessage}
                      </p>
                    )}
                  </Note>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              //the button is a note too, so nothing on the board is a ui control
              className="font-hand relative -rotate-2 bg-[#fff59d] px-10 py-4 text-3xl shadow-[3px_5px_10px_rgba(0,0,0,0.3)] transition-transform hover:rotate-0 disabled:opacity-60"
              style={{ color: INK }}
            >
              <Pin index={1} />
              {isSubmitting ? "Pinning…" : "Pin it up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
