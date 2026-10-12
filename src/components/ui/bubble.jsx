import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

function BubbleGroup({ className, ...props }) {
  return <div data-slot="bubble-group" className={cn("flex min-w-0 flex-col gap-2", className)} {...props} />;
}

const bubbleVariants = cva("group/bubble relative flex w-fit min-w-0 max-w-[80%] flex-col gap-1 data-[align=end]:self-end data-[variant=ghost]:max-w-full", {
  variants: {
    variant: {
      default: "[&>[data-slot=bubble-content]]:bg-primary [&>[data-slot=bubble-content]]:text-primary-foreground",
      secondary: "[&>[data-slot=bubble-content]]:bg-secondary [&>[data-slot=bubble-content]]:text-secondary-foreground",
      muted: "[&>[data-slot=bubble-content]]:bg-muted [&>[data-slot=bubble-content]]:text-foreground",
      outline: "[&>[data-slot=bubble-content]]:border-border [&>[data-slot=bubble-content]]:bg-background [&>[data-slot=bubble-content]]:text-foreground",
      ghost: "[&>[data-slot=bubble-content]]:rounded-none [&>[data-slot=bubble-content]]:bg-transparent [&>[data-slot=bubble-content]]:p-0",
      destructive: "[&>[data-slot=bubble-content]]:bg-red-50 [&>[data-slot=bubble-content]]:text-red-800",
    },
  },
  defaultVariants: { variant: "default" },
});

function Bubble({ variant = "default", align = "start", className, ...props }) {
  return <div data-slot="bubble" data-variant={variant} data-align={align} className={cn(bubbleVariants({ variant }), className)} {...props} />;
}

function BubbleContent({ asChild = false, className, ...props }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="bubble-content"
      className={cn("w-fit min-w-0 max-w-full overflow-hidden break-words rounded-xl border border-transparent px-3.5 py-2.5 text-sm leading-relaxed group-data-[align=end]/bubble:self-end", className)}
      {...props}
    />
  );
}

export { BubbleGroup, Bubble, BubbleContent, bubbleVariants };
