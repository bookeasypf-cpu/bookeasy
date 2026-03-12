import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full h-6 w-6 border-2 border-blue-100 border-t-[#0066FF]",
        className
      )}
    />
  );
}
