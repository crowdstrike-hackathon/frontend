import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-px text-[11px] font-medium leading-[18px] [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-ink text-white",
        secondary: "border-transparent bg-paper-3 text-ink-2",
        outline: "border-line-strong bg-transparent text-ink-2",
        trusted: "border-emerald-700/20 bg-emerald-50 text-emerald-800",
        untrusted: "border-red-700/20 bg-red-50 text-red-800",
        requester: "border-line-strong bg-paper-3 text-ink-2",
        unknown: "border-amber-700/25 bg-amber-50 text-amber-800",
        allow: "border-transparent bg-transparent px-0 text-emerald-700",
        block: "border-transparent bg-red-700 text-white",
        hold: "border-transparent bg-amber-600 text-white",
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
