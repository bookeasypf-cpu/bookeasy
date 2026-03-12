import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "text" | "circle" | "card" | "image";
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className,
}: SkeletonProps) {
  const variants = {
    text: "h-4 rounded-md",
    circle: "rounded-full",
    card: "rounded-2xl",
    image: "rounded-xl",
  };

  const defaultSizes: Record<string, { width?: string | number; height?: string | number }> = {
    text: { width: "100%", height: undefined },
    circle: { width: 48, height: 48 },
    card: { width: "100%", height: 200 },
    image: { width: "100%", height: 180 },
  };

  const resolvedWidth = width ?? defaultSizes[variant]?.width;
  const resolvedHeight = height ?? defaultSizes[variant]?.height;

  return (
    <div
      className={cn("skeleton", variants[variant], className)}
      style={{
        width: typeof resolvedWidth === "number" ? `${resolvedWidth}px` : resolvedWidth,
        height: typeof resolvedHeight === "number" ? `${resolvedHeight}px` : resolvedHeight,
      }}
      aria-hidden="true"
    />
  );
}
