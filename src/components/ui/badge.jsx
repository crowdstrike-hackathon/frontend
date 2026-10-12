import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-slate-200 bg-white text-slate-600",
        trusted: "border-emerald-200 bg-emerald-50 text-emerald-700",
        untrusted: "border-rose-200 bg-rose-50 text-rose-700",
        requester: "border-sky-200 bg-sky-50 text-sky-700",
        unknown: "border-amber-200 bg-amber-50 text-amber-700",
        allow: "border-emerald-200 bg-emerald-50 text-emerald-700",
        block: "border-transparent bg-rose-600 text-white",
        hold: "border-transparent bg-amber-500 text-white",
        muted: "border-slate-200 bg-slate-50 text-slate-500",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
