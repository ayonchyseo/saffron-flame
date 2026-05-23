"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans uppercase tracking-widest2 text-[0.7rem] font-medium transition-all duration-500 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60",
  {
    variants: {
      variant: {
        gold:
          "bg-gold text-ink border border-gold hover:bg-gold-300 hover:shadow-gold-glow hover:-translate-y-px",
        outline:
          "border border-gold/40 text-bone hover:border-gold hover:text-gold hover:bg-gold/5",
        ghost: "text-bone/70 hover:text-gold",
        sang:
          "bg-sang text-bone border border-sang hover:bg-wine hover:shadow-ember-glow",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-14 px-9 text-[0.75rem]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "gold", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-cursor="hover"
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
