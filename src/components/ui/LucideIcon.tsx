"use client";

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
  Star,
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
  Star,
};

interface LucideIconProps {
  name: string | null | undefined;
  className?: string;
  fallback?: string;
}

/**
 * Renders a Lucide icon by its string name.
 * Used when sector.icon is stored as a string in the database.
 */
export default function LucideIcon({ name, className = "h-5 w-5", fallback = "Store" }: LucideIconProps) {
  const Icon = iconMap[name || fallback] || iconMap[fallback] || Store;
  return <Icon className={className} />;
}
