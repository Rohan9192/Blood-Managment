"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  as?: React.ElementType;
}

const Button = forwardRef<HTMLElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, as: Component = "button", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
      primary:
        "bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-lg shadow-rose-900/30 focus:ring-rose-500",
      secondary:
        "bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500",
      danger:
        "bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white focus:ring-red-500",
      ghost:
        "hover:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-500",
      outline:
        "border border-slate-600 hover:border-rose-500 text-slate-300 hover:text-rose-400 hover:bg-rose-950/20 focus:ring-rose-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-7 py-3 text-base",
    };

    return (
      <Component
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </Component>
    );
  }
);
Button.displayName = "Button";
export default Button;
