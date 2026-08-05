import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function GlassCard({ className, padded = true, ...props }: GlassCardProps) {
  return (
    <div
      className={cn("glass-squircle", padded && "p-5 sm:p-6", className)}
      {...props}
    />
  );
}
