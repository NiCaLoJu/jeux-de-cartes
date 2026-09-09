import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  primary: "bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent-strong)] text-white",
  mint: "bg-gradient-to-b from-emerald-300 to-emerald-500 text-emerald-950",
  peach: "bg-gradient-to-b from-orange-300 to-orange-500 text-orange-950",
  sky: "bg-gradient-to-b from-sky-300 to-sky-500 text-sky-950",
  danger: "bg-gradient-to-b from-rose-400 to-rose-600 text-white",
  ghost: "bg-white/40 dark:bg-white/10 text-current border border-white/50 dark:border-white/10",
} as const;

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-base",
  lg: "px-7 py-4 text-lg",
  xl: "px-9 py-5 text-xl",
} as const;

interface GlossyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}

export function GlossyButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: GlossyButtonProps) {
  return (
    <button
      className={cn(
        "glossy-button cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
