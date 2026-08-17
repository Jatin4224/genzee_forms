import { BlueprintTemplate } from "./blueprint";
import { ChalkboardTemplate } from "./chalkboard";
import { ClassicTemplate } from "./classic";
import { ComicTemplate } from "./comic";
import { CorkboardTemplate } from "./corkboard";
import { DeparturesTemplate } from "./departures";
import { ConversationTemplate } from "./conversation";
import { MenuTemplate } from "./menu";
import { NewspaperTemplate } from "./newspaper";
import { PaperTemplate } from "./paper";
import { PassportTemplate } from "./passport";
import { PolaroidTemplate } from "./polaroid";
import { ReceiptTemplate } from "./receipt";
import { QuestTemplate } from "./quest";
import { SpreadsheetTemplate } from "./spreadsheet";
import { StoryTemplate } from "./story";
import { TypewriterTemplate } from "./typewriter";
import { VendingTemplate } from "./vending";
import { TerminalTemplate } from "./terminal";
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
  STORY: {
    name: "Story",
    description:
      "Full-screen questions on bold gradients, with segmented progress bars and tap-to-advance.",
    Renderer: StoryTemplate,
    //a full-viewport scene built around one large question, same as Conversation
    previewScale: 0.32,
  },
  PAPER: {
    name: "Paper",
    description:
      "A printed sheet filled in by hand. Every question on one page, answers written on ruled blanks.",
    Renderer: PaperTemplate,
    //a document rather than a viewport-filling scene, so it previews close to Classic
    previewScale: 0.5,
  },
  TERMINAL: {
    name: "Terminal",
    description:
      "A command-line session. Answers echo back into the scrollback and Enter runs the next prompt.",
    Renderer: TerminalTemplate,
    //a window inset in the viewport, so it survives a slightly larger preview
    previewScale: 0.42,
  },
  QUEST: {
    name: "Quest",
    description:
      "An 8-bit dialogue box. Questions are spoken by a character, typed out a letter at a time.",
    Renderer: QuestTemplate,
    //pixel type is wide and the scene fills the viewport, so it previews small
    previewScale: 0.34,
  },
  COMIC: {
    name: "Comic",
    description:
      "Every question is a comic panel, asked from a speech bubble. Bold, bright and read as one page.",
    Renderer: ComicTemplate,
    //a page of panels rather than a viewport-filling scene, so it previews like Paper
    previewScale: 0.46,
  },
  DEPARTURES: {
    name: "Departures",
    description:
      "An airport split-flap board. Each question clatters into place a character at a time.",
    Renderer: DeparturesTemplate,
    //a board inset in the viewport, so it survives a slightly larger preview
    previewScale: 0.44,
  },
  SPREADSHEET: {
    name: "Spreadsheet",
    description:
      "A worksheet. Questions run down column A, answers are typed into column B, deadpan and orderly.",
    Renderer: SpreadsheetTemplate,
    //a document laid out in rows, so it previews around the same size as Comic
    previewScale: 0.46,
  },
  CORKBOARD: {
    name: "Corkboard",
    description:
      "Every question pinned up on its own sticky note, answered in handwriting. A board, not a form.",
    Renderer: CorkboardTemplate,
    //a wide board of notes, so it needs shrinking a little more than a single page
    previewScale: 0.4,
  },
  POLAROID: {
    name: "Polaroid",
    description:
      "Instant photos taped into an album. The question is the shot, your answer is the caption.",
    Renderer: PolaroidTemplate,
    //a spread of photos, so it previews at about the same size as the Corkboard
    previewScale: 0.4,
  },
  RECEIPT: {
    name: "Receipt",
    description:
      "A till receipt. Questions itemised down a strip of thermal paper, totalled and barcoded.",
    Renderer: ReceiptTemplate,
    //a narrow strip, so it reads fine at a larger preview than the wide layouts
    previewScale: 0.52,
  },
  MENU: {
    name: "Menu",
    description:
      "A tasting menu. Each question is a course, numbered in roman on cream card stock with gold rules.",
    Renderer: MenuTemplate,
    //a single printed card, so it previews around the same size as Paper
    previewScale: 0.5,
  },
  CHALKBOARD: {
    name: "Chalkboard",
    description:
      "A wooden-framed slate. Questions chalked up by hand and answered on drawn lines.",
    Renderer: ChalkboardTemplate,
    //a framed board, so it previews at about the same size as the Menu card
    previewScale: 0.48,
  },
  VENDING: {
    name: "Vending",
    description:
      "A vending machine. Questions sit behind the glass as coded slots; pick one and the answer drops into the tray.",
    Renderer: VendingTemplate,
    //a wide machine with a lot of chrome, so it previews small
    previewScale: 0.36,
  },
  PASSPORT: {
    name: "Passport",
    description:
      "The data page of a travel document, stamped and finished with a machine-readable strip.",
    Renderer: PassportTemplate,
    //a booklet page, so it previews around the same size as the other documents
    previewScale: 0.46,
  },
  BLUEPRINT: {
    name: "Blueprint",
    description:
      "A technical drawing sheet. Questions dimensioned like features, closed off with a title block.",
    Renderer: BlueprintTemplate,
    //a wide drawing sheet, so it previews a little smaller than the paper documents
    previewScale: 0.42,
  },
  NEWSPAPER: {
    name: "Newspaper",
    description:
      "A broadsheet front page. The title is the headline and every question is a story set in the columns.",
    Renderer: NewspaperTemplate,
    //a dense printed page, so it previews around the same size as the Blueprint
    previewScale: 0.42,
  },
  TYPEWRITER: {
    name: "Typewriter",
    description:
      "A sheet rolled into a typewriter, with every question struck onto the page in ribbon ink.",
    Renderer: TypewriterTemplate,
    //a single upright sheet, so it previews like the other paper documents
    previewScale: 0.48,
  },
};

export const DEFAULT_TEMPLATE_ID: FormTemplateId = "CLASSIC";

//stable order for the gallery and the style picker
export const FORM_TEMPLATE_IDS = Object.keys(FORM_TEMPLATES) as FormTemplateId[];

//falls back to the default so an unknown value from the api never blanks the page
export function getFormTemplate(id: string | undefined | null): FormTemplateEntry {
  return FORM_TEMPLATES[id as FormTemplateId] ?? FORM_TEMPLATES[DEFAULT_TEMPLATE_ID];
}
