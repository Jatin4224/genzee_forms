import { encodeFieldDescription } from "./character";
import type { PublicFormData } from "./types";

//a stand-in form used to preview a template in the dashboard gallery.
//it is never submitted - the preview is pointer-events-none
export const DEMO_FORM: PublicFormData = {
  id: "demo",
  title: "Customer feedback",
  description: "Tell us how we did. It only takes a minute.",
  template: "CLASSIC",
  fields: [
    {
      id: "demo-name",
      label: "Your name",
      labelKey: "your_name",
      description: encodeFieldDescription("CURIOUS"),
      placeholder: "Ada Lovelace",
      isRequired: true,
      index: "1",
      type: "TEXT",
    },
    {
      id: "demo-email",
      label: "Email address",
      labelKey: "email_address",
      description: encodeFieldDescription("HAPPY"),
      placeholder: "ada@example.com",
      isRequired: true,
      index: "2",
      type: "EMAIL",
    },
    {
      id: "demo-rating",
      label: "How many times have you used us?",
      labelKey: "how_many_times",
      description: encodeFieldDescription("ANGRY"),
      placeholder: "3",
      isRequired: false,
      index: "3",
      type: "NUMBER",
    },
    {
      id: "demo-subscribe",
      label: "Email me about product updates",
      labelKey: "email_me_about_product_updates",
      description: encodeFieldDescription("HAPPY"),
      placeholder: null,
      isRequired: false,
      index: "4",
      type: "YES_NO",
    },
  ],
};
