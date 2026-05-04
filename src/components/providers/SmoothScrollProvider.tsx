"use client";

import { useEffect } from "react";

export function SmoothScrollProvider() {
  useEffect(() => {
    // Skip Lenis on touch devices — native scroll is GPU-accelerated and
    // overriding it adds input latency/jank on lower-end mobiles (~70%
    // of Polynesian traffic).
    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    if (isTouch) return;

    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
    let rafId: number | null = null;
    let cancelled = false;

    // Dynamic import — keeps Lenis (~15KB gzip) out of mobile bundles
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return null;
}
