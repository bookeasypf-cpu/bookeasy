"use client";

import { useEffect, useRef, useState } from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * PacifikAI-inspired section title with animated underline
 * and dot indicator. Triggers on scroll into view.
 */
export function SectionTitle({
  title,
  subtitle,
  align = "center",
  className = "",
}: SectionTitleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${align === "center" ? "text-center" : "text-left"} ${className}`}
    >
      {/* Animated dot + line decoration */}
      <div
        className={`flex items-center gap-2 mb-4 ${
          align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        <div
          className="w-2 h-2 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00B4D8] transition-all duration-700"
          style={{
            transform: isVisible ? "scale(1)" : "scale(0)",
            opacity: isVisible ? 1 : 0,
            transitionDelay: "0.1s",
          }}
        />
        <div
          className="h-[2px] rounded-full bg-gradient-to-r from-[#0066FF] to-[#00B4D8]"
          style={{
            width: isVisible ? "40px" : "0px",
            opacity: isVisible ? 1 : 0,
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
            transitionDelay: "0.2s",
          }}
        />
      </div>

      {/* Title with animated underline */}
      <h2
        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 transition-all duration-700"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          filter: isVisible ? "blur(0)" : "blur(4px)",
          transitionDelay: "0.15s",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <span className={`section-title-line ${isVisible ? "is-visible" : ""}`}>
          {title}
        </span>
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          className={`text-gray-500 text-sm sm:text-base leading-relaxed transition-all duration-700 ${
            align === "center" ? "max-w-lg mx-auto" : ""
          }`}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(15px)",
            filter: isVisible ? "blur(0)" : "blur(3px)",
            transitionDelay: "0.3s",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
