import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-sm border px-1.5 py-px text-[11px] font-medium leading-[18px] [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-ink text-white",
        secondary: "border-transparent bg-paper-3 text-ink-2",
        outline: "border-line-strong bg-transparent text-ink-2",
        trusted: "gap-1.5 border-transparent bg-transparent px-0 font-mono font-normal before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-[''] text-ink-3 before:bg-emerald-600",
        untrusted: "gap-1.5 border-transparent bg-transparent px-0 font-mono font-normal before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-[''] text-red-700 before:bg-red-600",
        requester: "gap-1.5 border-transparent bg-transparent px-0 font-mono font-normal before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-[''] text-ink-3 before:bg-ink-4",
        unknown: "gap-1.5 border-transparent bg-transparent px-0 font-mono font-normal before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-[''] text-amber-700 before:bg-amber-500",
        allow: "border-transparent bg-transparent px-0 text-emerald-700",
        block: "border-transparent bg-transparent px-0 text-red-700",
        hold: "border-transparent bg-transparent px-0 text-amber-700",
        muted: "border-transparent bg-transparent px-0 text-ink-4",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
