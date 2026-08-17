"use client";

import { Controller } from "react-hook-form";

import { cn } from "~/lib/utils";

import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormField } from "./types";

/*
 * A form as the front page of a broadsheet. The form's title is the lead
 * headline, each question is a story set in the columns below it, and answers are
 * typed on the ruled lines. Like the other print styles it shows every question
 * at once - a front page is read as a page.
 *
 * Hard-coded ink-on-newsprint colours, so it prints the same in either theme.
 */

const NEWSPRINT = "#ece7db";
const INK = "#1a1a1a";
const FADED = "#5c574e";
const RED = "#a3281f";

//the publication the form is printed in; the form's own title is the headline
const MASTHEAD = "The Daily Form";

//newsprint is never flat white - a little tonal noise sells the stock
const STOCK = {
  backgroundColor: NEWSPRINT,
  backgroundImage: [
    "repeating-linear-gradient(0deg, rgba(0,0,0,0.014) 0 1px, transparent 1px 3px)",
    "radial-gradient(ellipse 60% 40% at 20% 15%, rgba(0,0,0,0.02), transparent 70%)",
  ].join(","),
} as const;

//a double rule, the separator a masthead sits between
function DoubleRule() {
  return (
    <div aria-hidden className="flex flex-col gap-[2px]">
      <span className="h-[2px] w-full" style={{ backgroundColor: INK }} />
      <span className="h-px w-full" style={{ backgroundColor: INK, opacity: 0.55 }} />
    </div>
  );
}

//the answer, set on the story's ruled line. yes/no is printed as two options the
//way a ballot or coupon would offer them
function Typeset({
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
          <div className="flex items-center gap-5">
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
                  className="font-heading flex items-center gap-2 text-xl"
                  style={{ color: selected ? INK : FADED }}
                >
                  <span
                    aria-hidden
                    className="grid size-4 place-items-center border text-[11px] leading-none"
                    style={{ borderColor: invalid ? RED : FADED }}
                  >
                    {selected ? "✕" : ""}
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
      //typed onto the rule, set in the same serif the page is composed in
      className="font-heading w-full border-b bg-transparent pb-1 text-xl outline-none placeholder:font-sans placeholder:text-xs placeholder:text-black/30"
      style={{ color: INK, borderColor: invalid ? RED : "rgba(26,26,26,0.3)" }}
    />
  );
}

//the sheet the paper is printed on
function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#3a352c] px-3 py-8 sm:px-6 sm:py-12">
      <div
        className="h-fit w-full max-w-4xl px-5 py-8 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.6)] sm:px-10 sm:py-10"
        style={{ ...STOCK, color: INK }}
      >
        {children}
      </div>
    </div>
  );
}

export function NewspaperTemplate({
  form,
  register,
  control,
  errors,
  isSubmitting,
  isSuccess,
  onSubmit,
}: FormTemplateProps) {
  //the edition line, built from the form so it needs no clock - a date computed
  //during render would differ between the server and the client
  const edition = `Vol. I · No. ${form.id.slice(0, 6).toUpperCase()} · Late Edition · One Penny`;

  if (isSuccess) {
    return (
      <Page>
        <div className="text-center">
          <DoubleRule />
          <p className="font-heading mt-6 text-6xl sm:text-7xl" style={{ color: RED }}>
            EXTRA!
          </p>
          <h2 className="font-heading mt-2 text-3xl sm:text-4xl">Response Filed</h2>
          <p className="mt-3 text-sm italic" style={{ color: FADED }}>
            Your answers have gone to press.
          </p>
          <div className="mt-6">
            <DoubleRule />
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {/* the masthead */}
      <header className="text-center">
        <DoubleRule />
        <h1 className="font-heading mt-3 text-4xl leading-none sm:text-6xl">{MASTHEAD}</h1>
        <p
          className="mt-2 text-[10px] tracking-[0.18em] uppercase sm:text-xs"
          style={{ color: FADED }}
        >
          {edition}
        </p>
        <div className="mt-3">
          <DoubleRule />
        </div>
      </header>

      {/* the lead: the form's own title, set as the front-page headline */}
      <div className="mt-7 text-center">
        <h2 className="font-heading text-3xl leading-tight text-balance wrap-break-word sm:text-5xl">
          {form.title}
        </h2>
        {form.description && (
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed wrap-break-word italic sm:text-base">
            {form.description}
          </p>
        )}
        <p
          className="mt-3 text-[10px] tracking-[0.2em] uppercase"
          style={{ color: FADED }}
        >
          By our own correspondent · {form.fields.length} report
          {form.fields.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="my-6">
        <span className="block h-px w-full" style={{ backgroundColor: INK, opacity: 0.4 }} />
      </div>

      {/* noValidate for the same reason as the other templates: the browser's own
          tooltip on an `email` input blocks submit with no submit event */}
      <form onSubmit={onSubmit} noValidate>
        {form.fields.length === 0 && (
          <p className="py-6 text-center text-sm italic" style={{ color: FADED }}>
            No stories filed for this edition.
          </p>
        )}

        {/* the columns. break-inside-avoid keeps a story from being split across
            two of them, which would separate a question from its answer line */}
        <ol
          className="columns-1 gap-8 sm:columns-2"
          style={{ columnRule: "1px solid rgba(26,26,26,0.22)" }}
        >
          {form.fields.map((field, index) => {
            const errorMessage = errors[field.labelKey]?.message as string | undefined;
            const { helperText } = parseFieldDescription(field.description);

            return (
              <li key={field.id} className="mb-7 break-inside-avoid">
                <p
                  className="text-[10px] tracking-[0.22em] uppercase"
                  style={{ color: RED }}
                >
                  Item {String(index + 1).padStart(2, "0")}
                  {field.isRequired && " · Required"}
                </p>

                <label
                  htmlFor={field.type === "YES_NO" ? undefined : field.id}
                  //the drop cap the first paragraph of a story opens with
                  className={cn(
                    "font-heading mt-1 block text-2xl leading-tight wrap-break-word",
                    "first-letter:float-left first-letter:pt-1 first-letter:pr-1.5 first-letter:text-5xl first-letter:leading-[0.8]",
                  )}
                >
                  {field.label}
                </label>

                <span
                  aria-hidden
                  className="mt-2 mb-2 block h-px w-full"
                  style={{ backgroundColor: INK, opacity: 0.25 }}
                />

                {helperText && (
                  <p className="mb-2 text-xs leading-relaxed wrap-break-word italic" style={{ color: FADED }}>
                    {helperText}
                  </p>
                )}

                <Typeset
                  field={field}
                  register={register}
                  control={control}
                  invalid={!!errorMessage}
                />

                {errorMessage && (
                  <p className="mt-1.5 text-xs wrap-break-word italic" style={{ color: RED }}>
                    Correction: {errorMessage}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-4">
          <DoubleRule />
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            //boxed like a classified advertisement
            className="font-heading border-2 px-10 py-3 text-2xl tracking-wide transition-colors hover:bg-black/5 disabled:opacity-50"
            style={{ borderColor: INK, color: INK }}
          >
            {isSubmitting ? "Going to press…" : "Go to press"}
          </button>
          <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: FADED }}>
            Printed and published by {MASTHEAD}
          </p>
        </div>
      </form>
    </Page>
  );
}
