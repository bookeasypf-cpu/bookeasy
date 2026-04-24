"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

export function AnimatedCard({ children, index = 0, className = "" }: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.1 + index * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedProgressProps {
  value: number;
  color?: "emerald" | "blue";
  delay?: number;
}

export function AnimatedProgress({ value, color = "emerald", delay = 0.8 }: AnimatedProgressProps) {
  const gradient =
    color === "emerald"
      ? "from-emerald-500 to-teal-400"
      : "from-[#0066FF] to-[#00B4D8]";

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
      <motion.div
        className={`bg-gradient-to-r ${gradient} h-2.5 rounded-full relative overflow-hidden`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{
          delay,
          duration: 1,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            delay: delay + 1,
            duration: 0.8,
            ease: "easeOut",
          }}
        />
      </motion.div>
    </div>
  );
}

interface AnimatedListItemProps {
  children: ReactNode;
  index?: number;
}

export function AnimatedListItem({ children, index = 0 }: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.6 + index * 0.1,
        duration: 0.4,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
