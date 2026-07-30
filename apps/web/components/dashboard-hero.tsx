"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import { useUser } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { CreateFormDialog } from "~/components/create-form-dialog";

export function DashboardHero() {
  const { user } = useUser();
  const firstName = user?.fullName?.trim().split(/\s+/)[0] ?? "";

  return (
    <section className="flex flex-col gap-6 py-6">
      <div className="flex flex-col gap-2">
        <p className="text-lg text-muted-foreground">
          Hi{firstName ? `, ${firstName}` : ""}
        </p>
        <h1 className="max-w-2xl text-4xl leading-tight md:text-5xl">
          Create a form in seconds.
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Build a form, publish it, share the link, and watch responses roll in — no code
          required.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <CreateFormDialog />
        <Button variant="ghost" asChild>
          <Link href="/dashboard/forms">
            Browse all forms
            <IconArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
