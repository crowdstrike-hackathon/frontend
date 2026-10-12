import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "../../lib/utils";

const ToggleGroup = React.forwardRef(({ className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root ref={ref} className={cn("inline-flex items-center gap-0.5 rounded-lg bg-paper-3 p-0.5", className)} {...props}>
    {children}
  </ToggleGroupPrimitive.Root>
));
ToggleGroup.displayName = "ToggleGroup";

const ToggleGroupItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "inline-flex h-7 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-[12.5px] font-medium text-ink-3 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-white data-[state=on]:text-ink data-[state=on]:shadow-[0_0_0_1px_#C3D2E2] [&_svg]:size-3.5",
      className
    )}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Item>
));
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
