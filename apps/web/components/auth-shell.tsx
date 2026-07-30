import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconInnerShadowTop } from "@tabler/icons-react";

import { cn } from "~/lib/utils";
import characterImg from "../app/assets/character.png";
import borderImg from "../app/assets/character-border.png";

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

      <div className="relative hidden overflow-hidden bg-background lg:block">
        {/* animated wordmark marquee filling the panel, behind the character */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col justify-center  overflow-hidden mask-[radial-gradient(ellipse_44%_48%_at_50%_50%,#000_68%,transparent_92%)]"
        >
          {Array.from({ length: 4 }).map((_, row) => (
            <div
              key={row}
              className={cn(
                "flex w-max shrink-0 font-sans text-[5.5rem] leading-none font-black tracking-tighter whitespace-nowrap text-[#f2683e] uppercase select-none",
                row % 2 === 0 ? "animate-marquee" : "animate-marquee-reverse",
              )}
              style={{ "--marquee-duration": `${22 + row * 4}s` } as CSSProperties}
            >
              <span className="pr-10">Genzee Forms Genzee Forms Genzee Forms</span>
              <span className="pr-10">Genzee Forms Genzee Forms Genzee Forms</span>
            </div>
          ))}
        </div>

        <div className="absolute top-1/2 left-1/2 h-[84%] w-[64%] -translate-x-1/2 -translate-y-1/2">
          <Image
            src={characterImg}
            alt=""
            fill
            priority
            placeholder="blur"
            sizes="80vw"
            className="object-cover"
          />
        </div>

        {/* torn-paper frame on top; screen keeps the white torn edges and lets the
         * content show through the dark centre. */}
        <Image
          src={borderImg}
          alt=""
          fill
          priority
          sizes="140vw"
          className="pointer-events-none object-cover  "
        />
      </div>
    </div>
  );
}
