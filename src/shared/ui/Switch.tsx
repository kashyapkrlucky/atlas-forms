"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../utils";

export function Switch({
  checked,
  onCheckedChange,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "relative h-5.5 w-9.5 shrink-0 cursor-pointer rounded-full bg-slate-200 transition-colors data-[state=checked]:bg-violet-600 outline-none focus-visible:ring-2 focus-visible:ring-violet-300",
        className
      )}
    >
      <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.75 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-4.25" />
    </SwitchPrimitive.Root>
  );
}
