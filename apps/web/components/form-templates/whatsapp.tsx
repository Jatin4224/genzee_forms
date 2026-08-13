"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import {
  IconArrowLeft,
  IconChecks,
  IconDotsVertical,
  IconMoodSmile,
  IconPaperclip,
  IconPhone,
  IconSend,
  IconVideo,
} from "@tabler/icons-react";

import { cn } from "~/lib/utils";

import chatBackground from "../../app/assets/images/whatsapp-template-background-image.jpeg";
import { parseFieldDescription } from "./character";
import { getFieldRules, getInputType } from "./field-control";
import type { FormTemplateProps, PublicFormData, PublicFormField } from "./types";

/*
 * A form rendered as a chat thread. Questions arrive as incoming messages, the
 * respondent's answers go out as outgoing ones, and every question is preceded by
 * a typing indicator so the thread reads like a real conversation.
 *
 * Colours are the WhatsApp dark palette, hard-coded like the Conversation
 * template's: this style is always dark whatever theme the rest of the app is in.
 */

//how long the contact "types" before a question lands. scaled by question length
//so a long question takes visibly longer to arrive, clamped to a 1.5-2.8s band
function typingDelay(text: string) {
  return Math.min(2800, 1500 + text.length * 20);
}

//the pause before the closing thank-you message, once the response is recorded
const CLOSING_DELAY_MS = 1400;

const CLOSING_MESSAGE = "Thanks! Your response has been recorded.";

interface ChatMessage {
  //stable per message so a re-render never appends a duplicate - see the reveal effect
  id: string;
  side: "in" | "out";
  text: string;
  //a field's helper text, shown as a dimmer second line in the same bubble
  note?: string;
  time: string;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

//the avatar stands in for the form owner, so it is built from the form's own title
function getInitials(title: string) {
  const initials = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("");

  return initials.toUpperCase() || "F";
}

//what an answer looks like once it is a sent message. a password is masked, since
//the thread stays on screen for the rest of the fill
function answerText(field: PublicFormField, value: unknown) {
  if (field.type === "YES_NO") return value ? "Yes" : "No";

  const text = String(value ?? "").trim();

  if (field.type === "PASSWORD") return "•".repeat(text.length);

  return text;
}

//a finished thread for the gallery card. the live template starts empty and fills
//in over time, which would leave the preview looking like a blank chat
function previewTranscript(form: PublicFormData): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const times = ["14:19", "14:20", "14:22", "14:23", "14:25"];
  let tick = 0;

  const nextTime = () => times[Math.min(tick++, times.length - 1)]!;

  if (form.description) {
    messages.push({ id: "intro", side: "in", text: form.description, time: nextTime() });
  }

  //the placeholder is the field author's own example answer, so it doubles as
  //sample chat content without inventing anything
  for (const field of form.fields.slice(0, 2)) {
    messages.push({ id: `q-${field.id}`, side: "in", text: field.label, time: nextTime() });
    messages.push({
      id: `a-${field.id}`,
      side: "out",
      text: field.placeholder ?? "Sure",
      time: nextTime(),
    });
  }

  return messages;
}

function DateChip() {
  return (
    <div className="flex justify-center py-2">
      <span className="rounded-lg bg-[#182229] px-3 py-1 text-[11px] font-medium tracking-wide text-[#8696a0] uppercase shadow-sm">
        Today
      </span>
    </div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isOut = message.side === "out";

  return (
    <div className={cn("flex w-full", isOut ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[85%] rounded-lg px-2.5 py-1.5 text-[15px] shadow-sm sm:max-w-[75%]",
          //the squared-off corner is the one the tail hangs from
          isOut ? "rounded-tr-none bg-[#005c4b]" : "rounded-tl-none bg-[#202c33]",
        )}
      >
        {/* the tail: a css triangle in the bubble's own colour */}
        <span
          aria-hidden
          className={cn(
            "absolute top-0 size-0 border-t-8",
            isOut
              ? "-right-2 border-l-8 border-t-[#005c4b] border-l-transparent"
              : "-left-2 border-r-8 border-t-[#202c33] border-r-transparent",
          )}
        />

        {/* a long answer with no spaces must wrap rather than widen the bubble */}
        <p className="wrap-break-word whitespace-pre-wrap text-[#e9edef]">{message.text}</p>
        {message.note && (
          <p className="wrap-break-word mt-0.5 text-[13px] text-[#e9edef]/60">{message.note}</p>
        )}

        <div className="mt-0.5 flex items-center justify-end gap-1 leading-none">
          <span className="text-[11px] text-[#e9edef]/50 tabular-nums">{message.time}</span>
          {isOut && <IconChecks className="size-4 shrink-0 text-[#53bdeb]" aria-hidden />}
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex w-full justify-start">
      <div className="relative rounded-lg rounded-tl-none bg-[#202c33] px-4 py-3 shadow-sm">
        <span
          aria-hidden
          className="absolute top-0 -left-2 size-0 border-t-8 border-r-8 border-t-[#202c33] border-r-transparent"
        />
        <span className="sr-only">Typing a message</span>
        <span aria-hidden className="flex items-center gap-1">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="size-2 animate-bounce rounded-full bg-[#8696a0]"
              style={{ animationDelay: `${dot * 150}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

export function WhatsappTemplate({
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
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (isPreview) return previewTranscript(form);

    //the description opens the thread, the way a real chat starts with a greeting
    return form.description
      ? [{ id: "intro", side: "in", text: form.description, time: formatTime(new Date()) }]
      : [];
  });
  //the preview holds the indicator on screen forever - it is the point of this style
  const [isTyping, setIsTyping] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  //a quick reply knows its own answer, and sends before react has re-rendered with it
  const pendingAnswer = useRef<string | null>(null);
  //outgoing messages are numbered rather than keyed by field: a failed submit leaves
  //the thread on the last question, and re-sending must not reuse a message id
  const sentCount = useRef(0);

  const field = form.fields[step];
  const fieldId = field?.id;
  const fieldLabel = field?.label;
  const fieldDescription = field?.description;
  const isLast = step === total - 1;

  //while the response is in flight the contact is, in effect, still typing
  const showTyping = isTyping || isSubmitting;

  const answer = useWatch({ control, name: field?.labelKey ?? "__unanswered__" });
  const errorMessage = field ? (errors[field.labelKey]?.message as string | undefined) : undefined;

  //reveal the current question after a pause. appending is keyed on the field id so a
  //re-run (a refetch, strict mode's double effect) can never post it twice
  useEffect(() => {
    if (isPreview || isSuccess || !fieldId || !fieldLabel) return;

    setIsTyping(true);

    const timer = setTimeout(() => {
      setIsTyping(false);
      setMessages((current) =>
        current.some((message) => message.id === `q-${fieldId}`)
          ? current
          : [
              ...current,
              {
                id: `q-${fieldId}`,
                side: "in",
                text: fieldLabel,
                note: parseFieldDescription(fieldDescription).helperText ?? undefined,
                time: formatTime(new Date()),
              },
            ],
      );
    }, typingDelay(fieldLabel));

    return () => clearTimeout(timer);
  }, [fieldId, fieldLabel, fieldDescription, isPreview, isSuccess]);

  //a form with no fields has nothing to reveal, so say so instead of typing forever
  useEffect(() => {
    if (isPreview || total > 0) return;

    setIsTyping(false);
    setMessages((current) =>
      current.some((message) => message.id === "empty")
        ? current
        : [
            ...current,
            {
              id: "empty",
              side: "in",
              text: "There are no questions to answer here yet.",
              time: formatTime(new Date()),
            },
          ],
    );
  }, [total, isPreview]);

  //sign off once the response is recorded
  useEffect(() => {
    if (isPreview || !isSuccess) return;

    setIsTyping(true);

    const timer = setTimeout(() => {
      setIsTyping(false);
      setMessages((current) =>
        current.some((message) => message.id === "closing")
          ? current
          : [
              ...current,
              {
                id: "closing",
                side: "in",
                text: CLOSING_MESSAGE,
                time: formatTime(new Date()),
              },
            ],
      );
    }, CLOSING_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isSuccess, isPreview]);

  //follow the thread. setting scrollTop directly keeps the scroll inside this pane -
  //scrollIntoView would drag the dashboard around behind a gallery preview
  useEffect(() => {
    const pane = scrollRef.current;
    if (pane) pane.scrollTop = pane.scrollHeight;
  }, [messages, showTyping]);

  //hand focus back to the composer as each question lands
  useEffect(() => {
    if (isPreview || showTyping) return;

    inputRef.current?.focus();
  }, [showTyping, fieldId, isPreview]);

  //one path for both the composer and the quick replies: validate the current answer,
  //post it, then either move to the next question or submit the whole form
  const onSend: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const quickReply = pendingAnswer.current;
    pendingAnswer.current = null;

    if (isPreview || !field || showTyping) return;

    const isValid = await trigger(field.labelKey);
    if (!isValid) return;

    const text = quickReply ?? answerText(field, answer);

    //an optional question left blank is skipped rather than posted as an empty bubble
    if (text) {
      setMessages((current) => [
        ...current,
        { id: `a-${sentCount.current++}`, side: "out", text, time: formatTime(new Date()) },
      ]);
    }

    if (isLast) {
      try {
        await onSubmit(event);
      } catch {
        //useSubmitForm already toasts the failure. swallowing it here keeps the
        //rejection from escaping this handler, and leaves the thread on the last
        //question so the answer can be sent again
      }
      return;
    }

    setStep((current) => current + 1);
  };

  const isComposerDisabled = isPreview || showTyping || isSuccess || !field;
  //registered once per render so the spread and the composed ref share one registration
  const registration =
    field && field.type !== "YES_NO" ? register(field.labelKey, getFieldRules(field)) : null;

  return (
    <div className="relative flex h-[100svh] w-full flex-col overflow-hidden bg-[#0b141a] text-[#e9edef]">
      {/* the doodle pattern tiles behind the whole thread; the wash over it keeps the
          bubbles readable wherever a dense patch of doodles lands. anchored to the
          template rather than the scroll pane, so it stays put as the thread grows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${chatBackground.src})`,
          backgroundRepeat: "repeat",
          //the source is a 166x303 phone wallpaper, so it tiles near its own size -
          //stretching it to fill a desktop width would just blur the doodles
          backgroundSize: "240px auto",
        }}
      />
      {/* the tile is not seamless; a wash over it softens the repeat and settles the
          pattern behind the thread. bubbles are opaque, so this is tone, not contrast */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-[#0b141a]/45" />

      <header className="relative z-10 flex shrink-0 items-center gap-3 bg-[#202c33] px-3 py-2 sm:px-4">
        <IconArrowLeft className="size-5 shrink-0 text-[#aebac1]" aria-hidden />

        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#00a884]/20 text-sm font-medium text-[#00a884]">
          {getInitials(form.title)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base leading-tight font-medium">{form.title}</p>
          <p className="truncate text-xs text-[#8696a0]">{showTyping ? "typing…" : "online"}</p>
        </div>

        <div aria-hidden className="flex shrink-0 items-center gap-4 text-[#aebac1]">
          <IconVideo className="size-5" />
          <IconPhone className="size-5" />
          <IconDotsVertical className="size-5" />
        </div>
      </header>

      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-3 py-3 sm:px-4">
          <DateChip />

          {messages.map((message) => (
            <Bubble key={message.id} message={message} />
          ))}

          {showTyping && <TypingBubble />}
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={onSend}
        //the browser's own validation would block submit before onSend runs - an
        //`email` input rejects a malformed address with a native tooltip and no
        //submit event, so the thread would freeze with nothing said. react-hook-form
        //owns validation here, and reports it as a line above the composer
        noValidate
        className="relative z-10 shrink-0 bg-[#202c33] px-3 py-3"
      >
        <div className="mx-auto w-full max-w-2xl">
          {errorMessage && <p className="mb-2 px-2 text-xs text-[#f15c6d]">{errorMessage}</p>}

          {/* once the response is in, the last question's quick replies would sit there
              as dead buttons - fall back to the neutral composer instead */}
          {field?.type === "YES_NO" && !isSuccess ? (
            <Controller
              control={control}
              name={field.labelKey}
              defaultValue={null}
              rules={getFieldRules(field)}
              render={({ field: controlled }) => (
                <div className="flex items-center gap-2">
                  {[
                    { label: "Yes", value: true },
                    { label: "No", value: false },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      disabled={isComposerDisabled}
                      onClick={() => {
                        controlled.onChange(option.value);
                        pendingAnswer.current = option.label;
                        //go through the form's own submit so the send path stays single
                        formRef.current?.requestSubmit();
                      }}
                      className="flex-1 rounded-full border border-[#00a884]/40 bg-[#2a3942] px-4 py-3 text-[15px] text-[#00a884] transition-colors hover:bg-[#00a884]/15 disabled:opacity-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-full bg-[#2a3942] px-4 py-2.5">
                <IconMoodSmile aria-hidden className="size-6 shrink-0 text-[#8696a0]" />

                {field && registration ? (
                  <input
                    //remounts per question, so a stale value never carries over visually
                    key={field.id}
                    {...registration}
                    //composed after the spread: react-hook-form still gets the element,
                    //and the composer keeps its own handle on it to restore focus
                    ref={(element) => {
                      registration.ref(element);
                      inputRef.current = element;
                    }}
                    type={getInputType(field)}
                    placeholder={showTyping ? "typing…" : (field.placeholder ?? "Type a message")}
                    disabled={isComposerDisabled}
                    autoComplete="off"
                    aria-label={field.label}
                    aria-invalid={!!errorMessage}
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-[#e9edef] outline-none placeholder:text-[#8696a0] disabled:cursor-not-allowed"
                  />
                ) : (
                  <span className="flex-1 text-[15px] text-[#8696a0]">Type a message</span>
                )}

                <IconPaperclip aria-hidden className="size-6 shrink-0 text-[#8696a0]" />
              </div>

              <button
                type="submit"
                disabled={isComposerDisabled}
                aria-label="Send answer"
                className="grid size-12 shrink-0 place-items-center rounded-full bg-[#00a884] text-[#0b141a] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <IconSend className="size-5" />
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
