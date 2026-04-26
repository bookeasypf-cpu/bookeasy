"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

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
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const rotate = useCallback(() => {
    if (!rotatingWords || rotatingWords.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentRotation((prev) => (prev + 1) % rotatingWords.length);
      setIsTransitioning(false);
    }, 400);
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

  // Find where the highlight words are to replace them with rotating text
  const highlightStartIndex = words.findIndex(
    (w) => typeof w === "object" && w.highlight
  );

  return (
    <h1 className={className}>
      {words.map((word, i) => {
        const isHighlight = typeof word === "object" && word.highlight;
        const text = typeof word === "object" ? word.text : word;
        const delay = 0.15 + i * 0.12;

        // If rotating mode and this is a highlight word
        if (isHighlight && rotatingWords && rotatingWords.length > 0) {
          // Only render the rotating block on the first highlight word
          if (i !== highlightStartIndex) return null;

          return (
            <span
              key="rotating"
              className="hero-word hero-word--highlight inline-block"
              style={{
                animationDelay: `${delay}s`,
                animationPlayState: isVisible ? "running" : "paused",
              }}
            >
              <span
                className={cn(
                  "inline-block transition-all duration-400",
                  isTransitioning
                    ? "opacity-0 translate-y-4 blur-sm"
                    : "opacity-100 translate-y-0 blur-0"
                )}
              >
                {rotatingWords[currentRotation]}
              </span>
              {"\u00A0"}
            </span>
          );
        }

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
