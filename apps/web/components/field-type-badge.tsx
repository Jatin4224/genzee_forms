import {
  IconCheckbox,
  IconHash,
  IconLetterCase,
  IconLock,
  IconMail,
  type Icon,
} from "@tabler/icons-react";

//each field type maps to a theme chart token (which already adapts to light/dark)
//plus an icon, so the builder scans quickly.
const TYPE_STYLES: Record<string, { label: string; icon: Icon; color: string }> = {
  TEXT: { label: "Text", icon: IconLetterCase, color: "var(--chart-3)" },
  NUMBER: { label: "Number", icon: IconHash, color: "var(--chart-4)" },
  EMAIL: { label: "Email", icon: IconMail, color: "var(--chart-2)" },
  YES_NO: { label: "Yes / No", icon: IconCheckbox, color: "var(--chart-1)" },
  PASSWORD: { label: "Password", icon: IconLock, color: "var(--chart-5)" },
};

export function FieldTypeBadge({ type }: { type: string }) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.TEXT!;
  const Icon = style.icon;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
      style={{
        color: style.color,
        borderColor: `color-mix(in oklch, ${style.color} 35%, transparent)`,
        backgroundColor: `color-mix(in oklch, ${style.color} 12%, transparent)`,
      }}
    >
      <Icon className="size-3" />
      {style.label}
    </span>
  );
}
