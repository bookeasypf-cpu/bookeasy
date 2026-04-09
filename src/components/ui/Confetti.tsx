"use client";

interface ConfettiProps {
  trigger?: boolean;
}

export function Confetti({ trigger = true }: ConfettiProps) {
  if (!trigger) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            backgroundColor: ["#0066FF", "#00B4D8", "#41DEA7", "#FFD700", "#FF6B6B"][i % 5],
            animation: `fall ${2 + Math.random()}s linear forwards`,
            animationDelay: `${i * 0.05}s`,
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
