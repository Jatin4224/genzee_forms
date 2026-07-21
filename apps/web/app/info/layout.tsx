import type { Metadata } from "next";

import { PRODUCT } from "~/components/info/content";

export const metadata: Metadata = {
  title: `${PRODUCT.name} — ${PRODUCT.tagline}`,
  description: PRODUCT.subtitle,
};

/**
 * The app's global theme is intentionally monochrome. The landing page needs
 * one accent, so it is scoped here rather than added to the global tokens —
 * nothing outside /info is affected.
 */
export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="info-scope min-h-screen bg-background text-foreground">{children}</div>
  );
}
