"use client";

import Image from "next/image";

import { cn } from "~/lib/utils";
import {
  CHARACTER_EXPRESSIONS,
  CHARACTER_EXPRESSION_LABELS,
  CHARACTER_IMAGES,
  CHARACTER_NAME,
  type CharacterExpression,
} from "~/components/form-templates";
import { Field, FieldLabel } from "~/components/ui/field";

interface CharacterExpressionPickerProps {
  value: CharacterExpression;
  onChange: (expression: CharacterExpression) => void;
}

//picks the face the character pulls while asking one question. shown wherever a
//field is authored for a form that renders with the Conversation style
export function CharacterExpressionPicker({ value, onChange }: CharacterExpressionPickerProps) {
  return (
    <Field>
      <FieldLabel>Character expression</FieldLabel>
      <p className="-mt-1 text-xs text-muted-foreground">
        How {CHARACTER_NAME} looks while asking this question.
      </p>

      <div role="radiogroup" aria-label="Character expression" className="grid grid-cols-3 gap-2">
        {CHARACTER_EXPRESSIONS.map((expression) => {
          const isSelected = value === expression;

          return (
            <button
              key={expression}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(expression)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-2 transition-colors",
                isSelected
                  ? "border-primary bg-primary/8"
                  : "border-border hover:border-primary/40",
              )}
            >
              <Image
                src={CHARACTER_IMAGES[expression]}
                alt=""
                className={cn(
                  "h-14 w-auto object-contain transition-opacity",
                  isSelected ? "opacity-100" : "opacity-60",
                )}
              />
              <span
                className={cn("text-xs", isSelected ? "text-primary" : "text-muted-foreground")}
              >
                {CHARACTER_EXPRESSION_LABELS[expression]}
              </span>
            </button>
          );
        })}
      </div>
    </Field>
  );
}
