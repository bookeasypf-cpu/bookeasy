"use client";

import { motion } from "framer-motion";

interface MonthStat {
  month: string;
  count: number;
  revenue: number;
}

interface AnimatedChartProps {
  data: MonthStat[];
  color?: "blue" | "emerald";
}

const CHART_HEIGHT = 140; // px for the bar area

export function AnimatedChart({ data, color = "blue" }: AnimatedChartProps) {
  const maxCount = Math.max(...data.map((m) => m.count), 1);

  const gradientFrom =
    color === "emerald" ? "#10b981" : "#0066FF";
  const gradientTo =
    color === "emerald" ? "#2dd4bf" : "#00B4D8";
  const textColor =
    color === "emerald" ? "text-emerald-400" : "text-[#00B4D8]";

  return (
    <div className="flex items-end gap-2 sm:gap-4" style={{ height: CHART_HEIGHT + 40 }}>
      {data.map((m, i) => {
        const barHeight = Math.max((m.count / maxCount) * CHART_HEIGHT, 6);
        return (
          <div
            key={m.month}
            className="flex-1 flex flex-col items-center justify-end"
            style={{ height: CHART_HEIGHT + 40 }}
          >
            {/* Count label */}
            <motion.span
              className={`text-xs font-bold ${textColor} mb-1.5`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.4 + i * 0.1,
                duration: 0.4,
                type: "spring",
                stiffness: 200,
              }}
            >
              {m.count}
            </motion.span>

            {/* Bar */}
            <motion.div
              className="w-full rounded-t-xl relative overflow-hidden"
              style={{
                background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
              }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: barHeight, opacity: 1 }}
              transition={{
                delay: 0.15 + i * 0.1,
                duration: 0.8,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                initial={{ y: "100%" }}
                animate={{ y: "-100%" }}
                transition={{
                  delay: 0.8 + i * 0.1,
                  duration: 0.6,
                  ease: "easeOut",
                }}
              />
            </motion.div>

            {/* Month label */}
            <motion.span
              className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
            >
              {m.month}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}
