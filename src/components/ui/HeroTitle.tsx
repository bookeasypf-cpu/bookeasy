"use client";

import { useEffect, useState } from "react";

interface HeroTitleProps {
  words: Array<string | { text: string; highlight: boolean }>;
  className?: string;
}

export function HeroTitle({ words, className = "" }: HeroTitleProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <h1 className={className}>
      {words.map((word, i) => {
        const isHighlight = typeof word === "object" && word.highlight;
        const text = typeof word === "object" ? word.text : word;
        const delay = 0.15 + i * 0.12;

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
