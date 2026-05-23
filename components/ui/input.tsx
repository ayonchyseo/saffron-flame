"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-cursor="hover"
      className={cn(
        "w-full bg-transparent text-bone font-sans text-base placeholder:text-bone/30",
        "border-b border-gold/25 px-0 py-3",
        "transition-colors duration-500",
        "focus:border-gold focus:outline-none",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
