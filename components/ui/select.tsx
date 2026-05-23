"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        data-cursor="hover"
        className={cn(
          "w-full bg-transparent text-bone font-sans text-base appearance-none",
          "border-b border-gold/25 px-0 py-3 pr-8",
          "transition-colors duration-500",
          "focus:border-gold focus:outline-none",
          "disabled:opacity-50",
          "[&>option]:bg-ink [&>option]:text-bone",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/60"
        aria-hidden
      />
    </div>
  ),
);
Select.displayName = "Select";
