import { ClassicTemplate } from "./classic";
import { ConversationTemplate } from "./conversation";
import { WhatsappTemplate } from "./whatsapp";
import type { FormTemplateEntry, FormTemplateId } from "./types";

//every visual style a form can render with.
//typed as Record<FormTemplateId, ...> on purpose: FormTemplateId comes from the backend
//enum, so adding a style there without adding a renderer here fails `pnpm check-types`
export const FORM_TEMPLATES: Record<FormTemplateId, FormTemplateEntry> = {
  CLASSIC: {
    name: "Classic",
    description: "Every question on one card. Familiar, compact and quick to fill in.",
    Renderer: ClassicTemplate,
  },
  CONVERSATION: {
    name: "Conversation",
    description:
      "One question at a time, asked by a character who pulls a different face for each one.",
    Renderer: ConversationTemplate,
    //a full-viewport scene, so it needs shrinking much further than a card to preview
    previewScale: 0.32,
  },
  WHATSAPP: {
    name: "Chat",
    description:
      "A messaging thread. Questions arrive one at a time, each after a pause where the sender is typing.",
    Renderer: WhatsappTemplate,
    //also full-viewport, but a chat reads at a smaller size than a single big question
    previewScale: 0.38,
  },
};

export const DEFAULT_TEMPLATE_ID: FormTemplateId = "CLASSIC";

//stable order for the gallery and the style picker
export const FORM_TEMPLATE_IDS = Object.keys(FORM_TEMPLATES) as FormTemplateId[];

//falls back to the default so an unknown value from the api never blanks the page
export function getFormTemplate(id: string | undefined | null): FormTemplateEntry {
  return FORM_TEMPLATES[id as FormTemplateId] ?? FORM_TEMPLATES[DEFAULT_TEMPLATE_ID];
}
