"use client";

import { useEffect, useRef, useState } from "react";

interface Step {
  icon: React.ElementType;
  step: string;
  title: string;
  description: string;
  color: string;
  neonColor: string;
  glowColor: string;
}

export function NeonSteps({ steps }: { steps: Step[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
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
    <div ref={containerRef} className="relative">
      {/* SVG neon trace overlay — desktop only */}
      <svg
        className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 900 200"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <defs>
          {/* Gradient for the full path */}
          <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="50%" stopColor="#00B4D8" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Animated gradient for the trace dot */}
          <radialGradient id="traceDot1">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/*
          Path:
          - Circle around card 1 (center ~150, 85, radius ~45)
          - Line to card 2
          - Circle around card 2 (center ~450, 85)
          - Line to card 3
          - Circle around card 3 (center ~750, 85)
        */}

        {/* Background dim path */}
        <path
          d="
            M 150 40
            A 45 45 0 1 1 149.99 40
            L 150 85
            L 450 85
            M 450 40
            A 45 45 0 1 1 449.99 40
            L 450 85
            L 750 85
            M 750 40
            A 45 45 0 1 1 749.99 40
          "
          stroke="url(#neonGrad)"
          strokeWidth="1.5"
          strokeOpacity="0.1"
          fill="none"
        />

        {/* Animated neon trace */}
        <path
          d="
            M 150 40
            A 45 45 0 1 1 149.99 40
            L 150 85
            L 450 85
            M 450 40
            A 45 45 0 1 1 449.99 40
            L 450 85
            L 750 85
            M 750 40
            A 45 45 0 1 1 749.99 40
          "
          stroke="url(#neonGrad)"
          strokeWidth="2"
          fill="none"
          filter="url(#neonGlow)"
          strokeLinecap="round"
          className={isVisible ? "neon-trace-path" : ""}
          style={{
            strokeDasharray: 2400,
            strokeDashoffset: isVisible ? 0 : 2400,
            transition: isVisible ? "stroke-dashoffset 4s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
            opacity: isVisible ? 1 : 0,
          }}
        />
      </svg>

      {/* Steps grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Timeline connector (desktop only) */}
        <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-[2px]">
          <div className="w-full h-full bg-gradient-to-r from-[#0066FF]/10 via-[#00B4D8]/15 to-[#10B981]/10 rounded-full" />
        </div>

        {steps.map((item, index) => (
          <div
            key={item.step}
            className="relative text-center group"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(30px)",
              transition: `opacity 0.6s ease-out, transform 0.6s ease-out`,
              transitionDelay: `${index * 0.2}s`,
            }}
          >
            {/* Step circle with neon ring */}
            <div className="relative mx-auto mb-6 w-28 h-28">
              {/* Neon ring glow */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: isVisible
                    ? `0 0 20px ${item.glowColor}, 0 0 40px ${item.glowColor}, inset 0 0 15px ${item.glowColor}`
                    : "none",
                  opacity: isVisible ? 0.4 : 0,
                  transition: "box-shadow 0.8s ease, opacity 0.8s ease",
                  transitionDelay: `${0.8 + index * 0.6}s`,
                }}
              />
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: isVisible ? item.neonColor : "transparent",
                  boxShadow: isVisible ? `0 0 8px ${item.glowColor}` : "none",
                  opacity: isVisible ? 0.5 : 0,
                  transition: "all 0.6s ease",
                  transitionDelay: `${0.6 + index * 0.6}s`,
                }}
              />
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
              <div className={`absolute inset-3 rounded-full bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  style={{
                    boxShadow: isVisible
                      ? `0 4px 15px ${item.glowColor}, 0 0 30px ${item.glowColor}`
                      : undefined,
                    transition: "box-shadow 0.8s ease",
                    transitionDelay: `${1 + index * 0.6}s`,
                  }}
                >
                  <item.icon className="h-7 w-7 text-white" />
                </div>
              </div>
              {/* Step number badge */}
              <div
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center"
                style={{
                  boxShadow: isVisible ? `0 0 10px ${item.glowColor}` : undefined,
                  transition: "box-shadow 0.6s ease",
                  transitionDelay: `${1.2 + index * 0.6}s`,
                }}
              >
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
        ))}
      </div>
    </div>
  );
}
