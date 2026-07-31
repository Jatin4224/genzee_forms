import Link from "next/link";
import { IconInnerShadowTop } from "@tabler/icons-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <IconInnerShadowTop className="size-5 text-primary" />
          <span className="font-heading text-base text-foreground">Genzee Forms</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/login" className="transition-colors hover:text-foreground">
            Login
          </Link>
          <Link href="/login" className="transition-colors hover:text-foreground">
            Get Started
          </Link>
          <Link href="/info" className="transition-colors hover:text-foreground">
            About
          </Link>
        </div>
        <span>&copy; {new Date().getFullYear()} Genzee Forms</span>
      </div>
    </footer>
  );
}
