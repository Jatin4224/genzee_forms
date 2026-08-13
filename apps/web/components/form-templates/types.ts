import type { Control, FieldErrors, UseFormRegister, UseFormTrigger } from "react-hook-form";
import type { RouterOutputs } from "@repo/trpc/client";

//the public form payload, straight off the trpc output. templates render this
export type PublicFormData = RouterOutputs["form"]["getForm"];

export type PublicFormField = PublicFormData["fields"][number];

//the set of visual styles. derived from the backend enum so a style that exists
//server-side but has no renderer is a compile error in the registry
export type FormTemplateId = PublicFormData["template"];

//answers are keyed by labelKey while the form is being filled in,
//and remapped to formFieldId on submit - see use-public-form
export type PublicFormValues = Record<string, unknown>;

//everything a template needs to render. all form state is already wired up by
//usePublicForm, so a template only has to lay out markup
export interface FormTemplateProps {
  form: PublicFormData;
  register: UseFormRegister<PublicFormValues>;
  control: Control<PublicFormValues>;
  errors: FieldErrors<PublicFormValues>;
  //validate a subset of the fields on demand - a template that reveals one question
  //at a time needs this to check the current answer before moving on
  trigger: UseFormTrigger<PublicFormValues>;
  isSubmitting: boolean;
  //already wrapped in handleSubmit - pass it straight to <form onSubmit>
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  //true when the response has been recorded; templates render their own thank-you state
  isSuccess: boolean;
  //true only inside the gallery preview. most templates can ignore it - it exists for
  //styles that animate or reveal over time, which would otherwise preview as a blank
  //card. such a template should render a representative finished state and start no timers
  isPreview?: boolean;
}

export interface FormTemplateEntry {
  //shown in the gallery and the builder's style picker
  name: string;
  description: string;
  Renderer: React.ComponentType<FormTemplateProps>;
  //css scale the gallery preview renders at. full-viewport layouts need to be
  //shrunk further than a compact card to fit the same preview box
  previewScale?: number;
}
