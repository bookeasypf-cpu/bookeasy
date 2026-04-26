"use client";

import { useEffect, useState, useCallback } from "react";

interface HeroTitleProps {
  words: Array<string | { text: string; highlight: boolean }>;
  /** Rotating highlighted phrases that cycle after initial reveal */
  rotatingWords?: string[];
  /** Interval in ms between rotations (default 3000) */
  rotateInterval?: number;
  className?: string;
}

export function HeroTitle({
  words,
  rotatingWords,
  rotateInterval = 3000,
  className = "",
}: HeroTitleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [phase, setPhase] = useState<"visible" | "hiding" | "showing">("visible");

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const rotate = useCallback(() => {
    if (!rotatingWords || rotatingWords.length <= 1) return;

    // Phase 1: hide current word (slide up + fade out)
    setPhase("hiding");

    // Phase 2: swap text and show new word (slide up from below + fade in)
    setTimeout(() => {
      setCurrentRotation((prev) => (prev + 1) % rotatingWords.length);
      setPhase("showing");
    }, 350);

    // Phase 3: settle
    setTimeout(() => {
      setPhase("visible");
    }, 700);
  }, [rotatingWords]);

  useEffect(() => {
    if (!rotatingWords || rotatingWords.length <= 1) return;
    let interval: NodeJS.Timeout;
    const startDelay = setTimeout(() => {
      interval = setInterval(rotate, rotateInterval);
    }, 2500);
    return () => {
      clearTimeout(startDelay);
      clearInterval(interval);
    };
  }, [rotatingWords, rotateInterval, rotate]);

  // Find where the highlight words start
  const highlightStartIndex = words.findIndex(
    (w) => typeof w === "object" && w.highlight
  );

  // Compute rotating word inline styles for the 3-phase animation
  function getRotatingStyle(): React.CSSProperties {
    switch (phase) {
      case "hiding":
        return {
          opacity: 0,
          transform: "translateY(-20px)",
          filter: "blur(4px)",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        };
      case "showing":
        return {
          opacity: 1,
          transform: "translateY(0)",
          filter: "blur(0)",
          transition: "all 0.35s cubic-bezier(0.0, 0, 0.2, 1)",
        };
      default:
        return {
          opacity: 1,
          transform: "translateY(0)",
          filter: "blur(0)",
          transition: "none",
        };
    }
  }

  return (
    <h1 className={className}>
      {words.map((word, i) => {
        const isHighlight = typeof word === "object" && word.highlight;
        const text = typeof word === "object" ? word.text : word;
        const delay = 0.15 + i * 0.12;

        // Rotating highlight word
        if (isHighlight && rotatingWords && rotatingWords.length > 0) {
          // Only render once (on the first highlight word)
          if (i !== highlightStartIndex) return null;

          return (
            <span
              key="rotating-wrapper"
              className="hero-word"
              style={{
                animationDelay: `${delay}s`,
                animationPlayState: isVisible ? "running" : "paused",
              }}
            >
              <span
                className="hero-rotating-text"
                style={getRotatingStyle()}
              >
                {rotatingWords[currentRotation]}
              </span>
            </span>
          );
        }

        // Static highlight word (no rotating)
        if (isHighlight) {
          return (
            <span
              key={i}
              className="hero-word hero-word--highlight"
              style={{
                animationDelay: `${delay}s`,
                animationPlayState: isVisible ? "running" : "paused",
              }}
            >
              {text}
              {i < words.length - 1 ? "\u00A0" : ""}
            </span>
          );
        }

        // Normal word
        return (
          <span
            key={i}
            className="hero-word"
            style={{
              animationDelay: `${delay}s`,
              animationPlayState: isVisible ? "running" : "paused",
            }}
          >
            {text}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        );
      })}
    </h1>
  );
}
