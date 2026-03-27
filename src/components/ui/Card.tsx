import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export function Card({ children, className, hover = false, glass = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-gray-900/50 transition-all duration-300",
        glass
          ? "glass"
          : "bg-white dark:bg-gray-900",
        hover && "card-hover cursor-pointer hover:shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-100 dark:border-gray-800", className)}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}
