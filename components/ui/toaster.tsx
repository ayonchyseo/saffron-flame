"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-6 right-6 z-[100] flex max-h-screen w-full max-w-md flex-col gap-3 p-0",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = cva(
  "group relative pointer-events-auto flex w-full items-start justify-between gap-3 overflow-hidden border p-5 pr-10 transition-all glass filigree-corners data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-gold/30",
        gold: "border-gold/50 shadow-gold-glow",
        sang: "border-sang shadow-ember-glow",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
));
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    data-cursor="hover"
    className={cn(
      "absolute right-3 top-3 text-bone/60 hover:text-gold transition-colors",
      className,
    )}
    aria-label="Close"
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("font-display text-xl text-bone leading-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-sm text-bone/70 mt-1", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

/* ──────────────────────────────────────────
   Imperative API: useToast() + <Toaster />
   ────────────────────────────────────────── */

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "gold" | "sang";
};

type ToastCtx = {
  toasts: ToastItem[];
  toast: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

const Ctx = React.createContext<ToastCtx>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ toasts, toast, dismiss }}>
      <ToastProvider swipeDirection="right" duration={5000}>
        {children}
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            onOpenChange={(open) => !open && dismiss(t.id)}
          >
            <div className="flex-1 min-w-0">
              <ToastTitle>{t.title}</ToastTitle>
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </Ctx.Provider>
  );
}

export const useToast = () => React.useContext(Ctx);
