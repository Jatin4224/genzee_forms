"use client";

import { useRef, useState } from "react";

import { cn } from "~/lib/utils";

export interface SpotlightImageProps
  extends React.ComponentProps<"img"> {
  /** Radius of the brightened circle, in pixels. */
  radius?: number;
}

export function SpotlightImage({
  className,
  radius = 160,
  ...props
}: SpotlightImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const mask = position
    ? `radial-gradient(circle ${radius}px at ${position.x}px ${position.y}px, black 0%, black 40%, transparent 70%)`
    : undefined;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPosition(null)}
    >
      <img
        {...props}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
      />
      <img
        {...props}
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
          className,
          // Wins over any brightness the caller passed.
          "brightness-110",
          position ? "opacity-100" : "opacity-0",
        )}
        style={{
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
    </div>
  );
}
