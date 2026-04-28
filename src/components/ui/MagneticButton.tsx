"use client";

import { useRef, useState, type ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  className = "",
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("translate3d(0,0,0)");

  function handleMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTransform(`translate3d(${x * strength}px, ${y * strength}px, 0)`);
  }

  function handleMouseLeave() {
    setTransform("translate3d(0,0,0)");
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform,
        transition: "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
