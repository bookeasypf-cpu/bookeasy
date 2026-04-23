"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

type FormatType = "number" | "percent" | "price";

interface AnimatedNumberProps {
  value: number;
  formatType?: FormatType;
  className?: string;
  duration?: number;
}

function formatValue(n: number, type: FormatType): string {
  switch (type) {
    case "percent":
      return `${n}%`;
    case "price":
      return (
        new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) +
        " F"
      );
    default:
      return String(n);
  }
}

export function AnimatedNumber({
  value,
  formatType = "number",
  className,
  duration = 1.2,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(formatValue(0, formatType));

  useEffect(() => {
    if (!isInView) return;

    const end = value;
    const startTime = performance.now();
    const ms = duration * 1000;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ms, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(end * eased);
      setDisplay(formatValue(current, formatType));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, value, formatType, duration]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {display}
    </motion.span>
  );
}
