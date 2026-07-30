"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconClipboardText,
  IconLayoutDashboard,
  IconPlus,
} from "@tabler/icons-react";

import { useListForms } from "~/hooks/api/form";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { forms } = useListForms();

  //⌘K / Ctrl+K toggles the palette; a custom event lets UI buttons open it too
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("genzee:command-open", onOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("genzee:command-open", onOpen);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search your forms…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => go("/dashboard")}>
            <IconLayoutDashboard />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/dashboard/forms")}>
            <IconClipboardText />
            Forms
            <CommandShortcut>Go</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/dashboard/forms")}>
            <IconPlus />
            Create a new form
          </CommandItem>
        </CommandGroup>

        {forms && forms.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Your forms">
              {forms.map((form) => (
                <CommandItem
                  key={form.id}
                  value={`${form.title} ${form.id}`}
                  onSelect={() => go(`/dashboard/forms/${form.id}`)}
                >
                  <IconClipboardText />
                  <span className="truncate">{form.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
