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

export function AnimatedChart({ data, color = "blue" }: AnimatedChartProps) {
  const maxCount = Math.max(...data.map((m) => m.count), 1);

  const gradient =
    color === "emerald"
      ? "from-emerald-500 to-teal-400"
      : "from-[#0066FF] to-[#00B4D8]";

  const textColor =
    color === "emerald" ? "text-emerald-600" : "text-[#0066FF]";

  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((m, i) => {
        const pct = Math.max((m.count / maxCount) * 100, 4);
        return (
          <div
            key={m.month}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <motion.span
              className={`text-xs font-semibold ${textColor}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            >
              {m.count}
            </motion.span>
            <motion.div
              className={`w-full bg-gradient-to-t ${gradient} rounded-t-lg`}
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{
                delay: 0.1 + i * 0.08,
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{ minHeight: "4px" }}
            />
            <motion.span
              className="text-[10px] text-gray-500 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            >
              {m.month}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}
