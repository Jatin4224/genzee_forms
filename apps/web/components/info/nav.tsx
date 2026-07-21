"use client";

import * as React from "react";
import { MoonIcon, SunIcon, ZapIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "~/components/ui/button";
import { NAV_LINKS, PRODUCT } from "./content";

export function InfoNav() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // The theme is unknown until hydration; render a stable placeholder first.
  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-5">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <ZapIcon className="size-4 text-(--info-accent)" />
          {PRODUCT.name}
        </a>

        <ul className="ml-2 hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {mounted && resolvedTheme === "dark" ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )}
          </Button>
          <Button size="sm" asChild>
            <a href="#get">Get the template</a>
          </Button>
        </div>
      </nav>
    </header>
  );
}
