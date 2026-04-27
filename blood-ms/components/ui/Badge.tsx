import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "blood";
}

export default function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
    warning: "bg-amber-900/30 text-amber-400 border-amber-700/50",
    danger: "bg-red-900/30 text-red-400 border-red-700/50",
    info: "bg-blue-900/30 text-blue-400 border-blue-700/50",
    blood: "bg-rose-900/40 text-rose-400 border-rose-700/50 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
