"use client";

import { BadgeCheck } from "lucide-react";

interface ProBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * "Pro vérifié" badge displayed on merchant cards and profiles.
 * Shows a verified checkmark with gradient styling.
 */
export function ProBadge({ size = "sm", className = "" }: ProBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white shadow-sm ${sizeClasses[size]} ${className}`}
    >
      <BadgeCheck className={iconSizes[size]} />
      Pro
    </span>
  );
}
