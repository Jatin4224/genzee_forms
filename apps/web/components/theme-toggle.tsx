"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";

import { SidebarLabel } from "~/components/ui/animated-sidebar";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  //next-themes only knows the real theme on the client; wait for mount to avoid
  //a hydration mismatch on the icon/label.
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="group/sidebar flex items-center justify-start gap-2 rounded-md py-2 text-foreground transition-[padding,background-color] duration-150 hover:bg-sidebar-accent hover:px-2 hover:text-sidebar-accent-foreground"
    >
      {isDark ? (
        <IconSun className="h-5 w-5 shrink-0" />
      ) : (
        <IconMoon className="h-5 w-5 shrink-0" />
      )}
      <SidebarLabel className="transition-transform duration-150 group-hover/sidebar:translate-x-1">
        {isDark ? "Light mode" : "Dark mode"}
      </SidebarLabel>
    </button>
  );
}
