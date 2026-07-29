import Link from "next/link";
import { IconInnerShadowTop } from "@tabler/icons-react";

//shared branded split-panel used by both login and signup so they feel like
//one product. Left = brand + form; right = a warm terracotta panel.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-texture grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <Link href="/" className="flex items-center gap-2 self-start">
          <IconInnerShadowTop className="size-6 text-primary" />
          <span className="font-heading text-lg">Genzee Forms</span>
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-[oklch(0.74_0.1_78)]" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 p-12 text-center text-primary-foreground">
          <IconInnerShadowTop className="size-14 opacity-90" />
          <p className="font-heading text-4xl leading-tight">Forms, the warm way.</p>
          <p className="max-w-sm text-primary-foreground/85">
            Build a form, share a link, and collect responses — simple, and beautiful.
          </p>
        </div>
      </div>
    </div>
  );
}
