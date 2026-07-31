"use client";

import Link from "next/link";
import { IconInnerShadowTop } from "@tabler/icons-react";

import { Button } from "~/components/ui/button";
import { FancyButton } from "~/components/landing/fancy-button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <IconInnerShadowTop className="size-6 text-primary" />
          <span className="font-heading text-xl">Genzee Forms</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <FancyButton href="/login" variant="gradient-border" size="md">
            Get Started
          </FancyButton>
        </div>
      </div>
    </header>
  );
}
