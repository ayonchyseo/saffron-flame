"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { Suspense } from "react";
import {
  useIsMobile,
  usePrefersReducedMotion,
} from "@/hooks/useMediaQuery";

interface CanvasShellProps extends Omit<CanvasProps, "children"> {
  children: React.ReactNode;
}

/** Canvas wrapper that handles DPR + frameloop best-practices for the brand. */
export function CanvasShell({ children, camera, ...rest }: CanvasShellProps) {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();

  return (
    <Canvas
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={camera ?? { position: [0, 0.4, 3], fov: 36 }}
      frameloop={reduced ? "demand" : "always"}
      {...rest}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
