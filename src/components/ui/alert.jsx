import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-sm border px-3.5 py-3 text-sm has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        info: "border-line border-l-2 border-l-brand bg-white/60 text-ink [&>svg]:text-brand",
        success: "border-line border-l-2 border-l-emerald-600 bg-white/60 text-ink [&>svg]:text-emerald-600",
        warning: "border-line border-l-2 border-l-amber-500 bg-white/60 text-ink [&>svg]:text-amber-600",
        destructive: "border-line border-l-2 border-l-red-600 bg-white/60 text-ink [&>svg]:text-red-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Alert({ className, variant, ...props }) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }) {
  return <div data-slot="alert-title" className={cn("col-start-2 min-h-4 font-semibold tracking-tight", className)} {...props} />;
}

function AlertDescription({ className, ...props }) {
  return <div data-slot="alert-description" className={cn("col-start-2 grid justify-items-start gap-1 text-[13px] leading-relaxed text-ink-2", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
