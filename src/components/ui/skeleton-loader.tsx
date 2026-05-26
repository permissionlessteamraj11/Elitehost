import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "rectangular" | "circular" | "text";
}

export function SkeletonLoader({ className, variant = "rectangular" }: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        "shimmer-bg bg-white/5",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-xl",
        variant === "text" && "rounded h-4 w-full",
        className
      )}
    />
  );
}
