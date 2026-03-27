import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gradient";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-gradient-to-b from-[#0066FF] to-[#0052CC] text-white hover:from-[#0052CC] hover:to-[#003D99] shadow-lg shadow-blue-500/25 focus:ring-[#0066FF]/40",
      secondary:
        "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 shadow-sm focus:ring-gray-300/40",
      outline:
        "border border-[#0066FF]/30 text-[#0066FF] hover:bg-[#0066FF]/5 focus:ring-[#0066FF]/20",
      ghost:
        "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white focus:ring-gray-300/40",
      danger:
        "bg-gradient-to-b from-[#FF6B6B] to-[#E05555] text-white hover:from-[#E05555] hover:to-[#C94444] shadow-lg shadow-red-500/25 focus:ring-red-500/40",
      gradient:
        "bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white hover:from-[#0052CC] hover:to-[#0891B2] shadow-lg shadow-blue-500/25 focus:ring-[#0066FF]/40",
    };

    const sizes = {
      sm: "px-3.5 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-7 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "btn-press inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
