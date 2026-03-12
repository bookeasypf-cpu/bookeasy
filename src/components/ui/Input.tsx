import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm transition-all duration-200",
            "focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 focus:outline-none",
            "hover:border-gray-300",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-[#FF6B6B]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
