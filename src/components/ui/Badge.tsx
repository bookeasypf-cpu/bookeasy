import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gradient";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10",
    danger: "bg-red-50 text-[#FF6B6B] ring-1 ring-red-600/10",
    info: "bg-blue-50 text-[#0066FF] ring-1 ring-blue-600/10",
    gradient: "bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
