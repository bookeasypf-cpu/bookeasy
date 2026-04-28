"use client";

import { useEffect, useRef, useState } from "react";
import { Search, CalendarCheck, CheckCircle } from "lucide-react";

interface Step {
  iconName: "search" | "calendar" | "check";
  step: string;
  title: string;
  description: string;
  color: string;
  neonColor: string;
  glowColor: string;
}

const iconMap = {
  search: Search,
  calendar: CalendarCheck,
  check: CheckCircle,
};

export function NeonSteps({ steps }: { steps: Step[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      {/* Timeline connector (desktop only) */}
      <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-[2px]" ref={lineRef}>
        {/* Base dim line */}
        <div className="w-full h-full bg-gradient-to-r from-[#0066FF]/15 via-[#00B4D8]/20 to-[#10B981]/15 rounded-full" />

        {/* Neon trace line that fills progressively */}
        <div
          className="absolute inset-0 h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #0066FF, #00B4D8, #10B981)",
            boxShadow: "0 0 8px rgba(0, 102, 255, 0.6), 0 0 20px rgba(0, 180, 216, 0.3)",
            transformOrigin: "left center",
            transform: isVisible ? "scaleX(1)" : "scaleX(0)",
            transition: "transform 2s cubic-bezier(0.25, 1, 0.5, 1)",
            transitionDelay: "0.5s",
          }}
        />

        {/* Moving luminous dot */}
        <div
          className="hidden md:block absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10"
          style={{
            background: "radial-gradient(circle, #fff 0%, #00B4D8 50%, transparent 100%)",
            boxShadow: "0 0 12px #00B4D8, 0 0 24px #0066FF, 0 0 40px rgba(0, 180, 216, 0.5)",
            left: isVisible ? "100%" : "0%",
            transition: "left 2s cubic-bezier(0.25, 1, 0.5, 1)",
            transitionDelay: "0.5s",
            opacity: isVisible ? 1 : 0,
          }}
        />
      </div>

      {steps.map((item, index) => {
        const Icon = iconMap[item.iconName];
        return (
          <div
            key={item.step}
            className="relative text-center group"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(30px)",
              transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
              transitionDelay: `${index * 0.15}s`,
            }}
          >
            {/* Step circle */}
            <div className="relative mx-auto mb-6 w-28 h-28">
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
              <div className={`absolute inset-3 rounded-full bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}
                  style={{
                    boxShadow: isVisible
                      ? `0 4px 15px ${item.glowColor}, 0 0 25px ${item.glowColor}`
                      : undefined,
                    transition: "box-shadow 0.6s ease, transform 0.3s ease",
                    transitionDelay: `${0.8 + index * 0.7}s`,
                  }}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
              </div>
              {/* Step number badge */}
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center">
                <span className={`text-xs font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {item.step}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
