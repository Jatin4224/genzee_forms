import type { StaticImageData } from "next/image";

import harshAngry from "../../app/assets/images/harsh-angry.png";
import harshCurious from "../../app/assets/images/harsh-curious.png";
import harshHappy from "../../app/assets/images/harsh-happy.png";

//the character who asks the questions in the CONVERSATION template
export const CHARACTER_NAME = "Harsh";

//the faces the character can pull while asking a question
export const CHARACTER_EXPRESSIONS = ["CURIOUS", "HAPPY", "ANGRY"] as const;

export type CharacterExpression = (typeof CHARACTER_EXPRESSIONS)[number];

export const DEFAULT_CHARACTER_EXPRESSION: CharacterExpression = "CURIOUS";

export const CHARACTER_EXPRESSION_LABELS: Record<CharacterExpression, string> = {
  CURIOUS: "Curious",
  HAPPY: "Happy",
  ANGRY: "Angry",
};

export const CHARACTER_IMAGES: Record<CharacterExpression, StaticImageData> = {
  CURIOUS: harshCurious,
  HAPPY: harshHappy,
  ANGRY: harshAngry,
};

/*
 * A field's expression is stored in the existing `description` column rather than
 * a new one, so adding this feature stays a code-only change with no migration.
 *
 * The value is kept as a marker on the first line - `[expression:HAPPY]` - and
 * anything after it is still plain helper text. Encoding it this way means the
 * column keeps working as helper text for fields that have no expression set,
 * and for the templates that never show a character.
 */
const EXPRESSION_MARKER = /^\[expression:([A-Z_]+)\]\s*/;

export interface ParsedFieldDescription {
  expression: CharacterExpression;
  //what is left of the description once the marker is stripped
  helperText: string | null;
}

function isCharacterExpression(value: string): value is CharacterExpression {
  return (CHARACTER_EXPRESSIONS as readonly string[]).includes(value);
}

//reads the expression + helper text out of a field's description column.
//an unset or unrecognised expression falls back to the default face
export function parseFieldDescription(
  description: string | null | undefined,
): ParsedFieldDescription {
  if (!description) {
    return { expression: DEFAULT_CHARACTER_EXPRESSION, helperText: null };
  }

  const match = EXPRESSION_MARKER.exec(description);

  if (!match) {
    return { expression: DEFAULT_CHARACTER_EXPRESSION, helperText: description };
  }

  const rest = description.slice(match[0].length).trim();

  return {
    expression: isCharacterExpression(match[1]!) ? match[1] : DEFAULT_CHARACTER_EXPRESSION,
    helperText: rest || null,
  };
}

//the inverse of parseFieldDescription - builds the value to store in `description`
export function encodeFieldDescription(
  expression: CharacterExpression,
  helperText?: string | null,
): string {
  const text = helperText?.trim();

  return text ? `[expression:${expression}] ${text}` : `[expression:${expression}]`;
}
