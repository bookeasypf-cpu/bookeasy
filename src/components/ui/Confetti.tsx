"use client";

import { useState } from "react";

interface ConfettiProps {
  trigger?: boolean;
}

const COLORS = ["#0066FF", "#00B4D8", "#41DEA7", "#FFD700", "#FF6B6B"];

export function Confetti({ trigger = true }: ConfettiProps) {
  const [particles] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      duration: `${2 + Math.random()}s`,
      color: COLORS[i % 5],
      delay: `${i * 0.05}s`,
    })),
  );

  if (!trigger) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 animate-pulse"
          style={{
            left: p.left,
            top: `-10px`,
            backgroundColor: p.color,
            animation: `fall ${p.duration} linear forwards`,
            animationDelay: p.delay,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
