import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
}

export default function Card({ className, glass, hover, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800",
        glass
          ? "bg-slate-900/50 backdrop-blur-sm"
          : "bg-slate-900",
        hover && "hover:border-rose-800/50 hover:shadow-lg hover:shadow-rose-950/20 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
