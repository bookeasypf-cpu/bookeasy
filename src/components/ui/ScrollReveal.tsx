"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Animation direction: default "up", or "left", "right", "scale" */
  direction?: "up" | "left" | "right" | "scale";
  /** Delay in ms before the animation starts once visible */
  delay?: number;
  /** IntersectionObserver threshold (0-1). Default 0.15 */
  threshold?: number;
}

export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add a small timeout for delay if specified
          if (delay > 0) {
            setTimeout(() => {
              el.classList.add("scroll-reveal--visible");
            }, delay);
          } else {
            el.classList.add("scroll-reveal--visible");
          }
          // Once revealed, stop observing
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [delay, threshold]);

  const directionClass =
    direction === "up"
      ? "scroll-reveal"
      : direction === "left"
        ? "scroll-reveal--left"
        : direction === "right"
          ? "scroll-reveal--right"
          : "scroll-reveal--scale";

  return (
    <div
      ref={ref}
      className={`${directionClass} ${className}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
