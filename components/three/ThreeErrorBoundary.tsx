"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches any error thrown inside a Three.js canvas tree and renders a silent
 * fallback rather than crashing the entire page. Place this around every
 * <CanvasShell> so WebGL failures are contained.
 */
export class ThreeErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
