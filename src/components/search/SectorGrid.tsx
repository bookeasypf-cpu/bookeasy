"use client";

import Link from "next/link";
import { useCallback, useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Scissors,
  Sparkles,
  Droplets,
  Hand,
  Heart,
  Stethoscope,
  Activity,
  Pen,
  Dumbbell,
  Camera,
  Wrench,
  PawPrint,
  Store,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Scissors,
  Sparkles,
  Droplets,
  Hand,
  Heart,
  Stethoscope,
  Activity,
  Pen,
  Dumbbell,
  Camera,
  Wrench,
  PawPrint,
  Store,
};

// Sector accent colors for glow effects
const SECTOR_ACCENTS: Record<string, string> = {
  coiffeur: "0, 102, 255",
  barber: "99, 102, 241",
  estheticienne: "236, 72, 153",
  spa: "20, 184, 166",
  manucure: "244, 114, 182",
  massage: "239, 68, 68",
  tatoueur: "139, 92, 246",
  dentiste: "16, 185, 129",
  medecin: "6, 182, 212",
  "coach-sportif": "245, 158, 11",
};

interface SectorGridProps {
  sectors: { id: string; name: string; slug: string; icon: string | null }[];
}

/**
 * PacifikAI-inspired sector grid with:
 * - 3D tilt on hover (perspective + rotateX/Y)
 * - Mouse-tracking radial glow
 * - Staggered scroll-in with bounce
 * - Glassmorphism border on hover
 */
function SectorCard({
  sector,
  index,
}: {
  sector: { id: string; name: string; slug: string; icon: string | null };
  index: number;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const Icon = iconMap[sector.icon || "Store"] || Store;
  const accent = SECTOR_ACCENTS[sector.slug] || "0, 102, 255";

  // Scroll-triggered entrance
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 80);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  // 3D tilt + mouse-tracking glow
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const el = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // 3D tilt (max ±5°)
      const rotateY = ((x - centerX) / centerX) * 5;
      const rotateX = ((centerY - y) / centerY) * 5;

      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;

      // Mouse-tracking glow
      el.style.setProperty("--mouse-x", `${x}px`);
      el.style.setProperty("--mouse-y", `${y}px`);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }, []);

  return (
    <Link
      ref={cardRef}
      href={`/search?sector=${sector.slug}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="card-glow group flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 transition-all duration-400"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
          : "perspective(800px) translateY(30px) scale(0.9)",
        filter: isVisible ? "blur(0)" : "blur(6px)",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        transitionDuration: "0.6s",
        willChange: "transform, opacity, filter",
        boxShadow: isDark
          ? "0 2px 12px rgba(0,0,0,0.3)"
          : "0 2px 12px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = `0 20px 50px -12px rgba(${accent}, 0.3), 0 0 0 1px rgba(${accent}, 0.2)`;
        el.style.borderColor = `rgba(${accent}, 0.35)`;
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget;
        const dk = document.documentElement.classList.contains('dark');
        el.style.boxShadow = dk ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.04)";
        el.style.borderColor = "";
      }}
    >
      {/* Icon with bounce-in effect */}
      <div
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        style={{
          background: `linear-gradient(135deg, rgba(${accent}, 0.08), rgba(${accent}, 0.15))`,
        }}
      >
        {/* Glow ring behind icon on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{
            boxShadow: `0 0 25px rgba(${accent}, 0.25)`,
          }}
        />
        <Icon
          className="h-6 w-6 transition-all duration-300 group-hover:scale-110"
          style={{ color: `rgb(${accent})` }}
        />
      </div>

      {/* Label */}
      <span className="relative z-10 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 text-center leading-tight group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
        {sector.name}
      </span>
    </Link>
  );
}

export function SectorGrid({ sectors }: SectorGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {sectors.map((sector, index) => (
        <SectorCard key={sector.id} sector={sector} index={index} />
      ))}
    </div>
  );
}
