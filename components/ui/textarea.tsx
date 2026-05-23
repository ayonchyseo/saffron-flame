"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-cursor="hover"
      className={cn(
        "w-full bg-transparent text-bone font-sans text-base placeholder:text-bone/30",
        "border border-gold/20 rounded-none px-4 py-3 min-h-[120px] resize-none",
        "transition-colors duration-500",
        "focus:border-gold focus:outline-none",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
