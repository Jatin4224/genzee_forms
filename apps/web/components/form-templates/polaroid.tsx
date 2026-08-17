"use client";

import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as a page of instant photos taped into an album. The question is the
 * shot, the answer is the caption written on the white border underneath. Like
 * Classic, Paper, Comic, Spreadsheet and Corkboard it shows every question at once.
 *
 * Hard-coded album colours, so the page looks the same in either theme.
 */

const FRAME = "#fdfcf7";
const CAPTION_INK = "#2b2b2b";
//the same blue biro the Paper and Corkboard templates write with
const PEN = "#1d3f8f";

//the wash standing in for each photo, cycled by index so no two neighbours match
const PHOTO_WASHES = [
  "linear-gradient(150deg,#f6b6a0,#c2708a 55%,#5c3d63)",
  "linear-gradient(150deg,#a8d8d0,#4a8fa8 55%,#274a63)",
  "linear-gradient(150deg,#f6d6a0,#d9915c 55%,#7a4630)",
  "linear-gradient(150deg,#c3c9e8,#7a7fb5 55%,#3c3a63)",
  "linear-gradient(150deg,#bfe0a8,#6da76b 55%,#33553c)",
  "linear-gradient(150deg,#f3bcc9,#b0708f 55%,#4f3450)",
] as const;

//photos are taped in by hand, never straight. deterministic - a random tilt would
//differ between the server render and the client and break hydration
const TILTS = [-2.2, 1.6, -1.1, 2.4, -1.7, 1.3] as const;

//the album page: dark warm board with a faint grain
const ALBUM = {
  backgroundColor: "#2a211c",
  backgroundImage: [
    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.05) 0 1.5px, transparent 2px)",
    "radial-gradient(circle at 75% 70%, rgba(0,0,0,0.20) 0 2px, transparent 3px)",
  ].join(","),
  backgroundSize: "22px 22px, 31px 31px",
} as const;

function washFor(index: number) {
  return PHOTO_WASHES[index % PHOTO_WASHES.length]!;
}

//the strips of tape holding a photo to the page
function Tape() {
  return (
    <>
      <span
        aria-hidden
        className="absolute -top-2 -left-3 h-5 w-14 -rotate-12 bg-white/25 shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
      />
      <span
        aria-hidden
        className="absolute -top-2 -right-3 h-5 w-14 rotate-12 bg-white/25 shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
      />
    </>
  );
}

//one instant photo: the shot on top, the white caption border underneath
function Polaroid({
  index,
  photo,
  children,
  className,
}: {
  index: number;
  photo: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative p-3 pb-5 shadow-[4px_8px_18px_rgba(0,0,0,0.45)]", className)}
      style={{
        backgroundColor: FRAME,
        transform: `rotate(${TILTS[index % TILTS.length]}deg)`,
      }}
    >
      <Tape />

      {/* the shot. it grows with a long question rather than clipping it */}
      <div
        className="relative flex min-h-44 items-center justify-center overflow-hidden px-4 py-6"
        style={{ backgroundImage: washFor(index) }}
      >
        {/* a vignette, so the wash reads as a photograph rather than a swatch */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.35))]"
        />
        <div className="relative w-full text-center">{photo}</div>
      </div>

      {/* the white border below the shot, where a caption gets written */}
      <div className="px-1 pt-4">{children}</div>
    </div>
  );
}

//the caption written under the photo. text-like types get a ruled line, yes/no
//gets the two options with the chosen one underlined
function Caption({
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
          <div className="flex items-center gap-4">
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
                    "font-hand text-2xl transition-opacity",
                    selected ? "underline decoration-2 underline-offset-4" : "opacity-45 hover:opacity-80",
                  )}
                  style={{ color: PEN }}
                >
                  {option.label}
                  {selected && " ✓"}
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
      //written on the border itself: no box, just the line a caption sits on
      className="font-hand w-full border-b bg-transparent pb-1 text-2xl outline-none placeholder:font-sans placeholder:text-sm placeholder:text-black/25"
      style={{ color: PEN, borderColor: invalid ? "#c0392b" : "rgba(0,0,0,0.18)" }}
    />
  );
}

export function PolaroidTemplate({
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
      <div className="grid min-h-svh w-full place-items-center px-4 py-12" style={ALBUM}>
        <div className="w-full max-w-xs">
          <Polaroid
            index={0}
            photo={
              <p className="font-hand text-5xl text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                Thanks!
              </p>
            }
          >
            <p className="font-hand text-2xl" style={{ color: CAPTION_INK }}>
              Your response has been recorded.
            </p>
          </Polaroid>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full px-4 py-12 sm:px-8 sm:py-16" style={ALBUM}>
      <div className="mx-auto w-full max-w-5xl">
        {/* the album page heading, written straight on the board */}
        <header className="mb-12 text-center">
          <h1
            className="font-hand text-4xl wrap-break-word text-[#f5efe6] sm:text-5xl"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            {form.title}
          </h1>
          {form.description && (
            <p className="font-hand mx-auto mt-2 max-w-xl text-2xl wrap-break-word text-[#f5efe6]/65">
              {form.description}
            </p>
          )}
          <span aria-hidden className="mx-auto mt-4 block h-px w-24 bg-[#f5efe6]/25" />
        </header>

        {/* noValidate for the same reason as the other templates: the browser's own
            tooltip on an `email` input blocks submit with no submit event */}
        <form onSubmit={onSubmit} noValidate>
          {form.fields.length === 0 && (
            <div className="mx-auto w-full max-w-xs">
              <Polaroid
                index={2}
                photo={<p className="font-hand text-3xl text-white">Empty roll</p>}
              >
                <p className="font-hand text-2xl" style={{ color: CAPTION_INK }}>
                  No photos in this album yet.
                </p>
              </Polaroid>
            </div>
          )}

          {/* items-start so a taller photo never stretches the ones beside it -
              a scrapbook page is uneven by nature */}
          <ol className="grid items-start gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {form.fields.map((field, index) => {
              const errorMessage = errors[field.labelKey]?.message as string | undefined;
              const { helperText } = parseFieldDescription(field.description);

              return (
                <li key={field.id}>
                  <Polaroid
                    index={index}
                    photo={
                      <label
                        htmlFor={field.type === "YES_NO" ? undefined : field.id}
                        className="font-hand block text-3xl leading-snug wrap-break-word text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]"
                      >
                        {field.label}
                        {field.isRequired && <span className="text-[#ffd7d7]"> *</span>}
                      </label>
                    }
                  >
                    {helperText && (
                      <p
                        className="font-hand mb-1 text-lg leading-snug wrap-break-word"
                        style={{ color: CAPTION_INK, opacity: 0.6 }}
                      >
                        {helperText}
                      </p>
                    )}

                    <Caption
                      field={field}
                      register={register}
                      control={control}
                      invalid={!!errorMessage}
                    />

                    {errorMessage && (
                      <p className="font-hand mt-1 text-lg wrap-break-word text-[#c0392b]">
                        {errorMessage}
                      </p>
                    )}
                  </Polaroid>
                </li>
              );
            })}
          </ol>

          <div className="mt-14 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              //the button is a strip of photo paper too, so nothing on the page
              //reads as a ui control
              className="font-hand relative -rotate-1 px-10 py-4 text-3xl shadow-[4px_8px_18px_rgba(0,0,0,0.45)] transition-transform hover:rotate-0 disabled:opacity-60"
              style={{ backgroundColor: FRAME, color: CAPTION_INK }}
            >
              <Tape />
              {isSubmitting ? "Developing…" : "Add to album"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
