"use client";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "rose" | "blue" | "emerald" | "amber";
  description?: string;
}

const colorMap = {
  rose: {
    icon: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/20",
    value: "from-rose-400 to-rose-600",
    glow: "hover:shadow-rose-500/10 hover:border-rose-500/30",
    dot: "bg-rose-500",
    bar: "bg-gradient-to-t from-rose-600 to-rose-400",
  },
  blue: {
    icon: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20",
    value: "from-blue-400 to-blue-600",
    glow: "hover:shadow-blue-500/10 hover:border-blue-500/30",
    dot: "bg-blue-500",
    bar: "bg-gradient-to-t from-blue-600 to-blue-400",
  },
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20",
    value: "from-emerald-400 to-emerald-600",
    glow: "hover:shadow-emerald-500/10 hover:border-emerald-500/30",
    dot: "bg-emerald-500",
    bar: "bg-gradient-to-t from-emerald-600 to-emerald-400",
  },
  amber: {
    icon: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20",
    value: "from-amber-400 to-amber-600",
    glow: "hover:shadow-amber-500/10 hover:border-amber-500/30",
    dot: "bg-amber-500",
    bar: "bg-gradient-to-t from-amber-600 to-amber-400",
  },
};

export default function StatsCard({ title, value, icon: Icon, trend, color = "rose", description }: StatsCardProps) {
  const colors = colorMap[color];
  return (
    <div className={cn(
      "stat-card group relative rounded-2xl border border-slate-800/80 p-5 overflow-hidden",
      "bg-gradient-to-br from-slate-900/90 to-slate-950/90",
      "hover:shadow-xl transition-all duration-300",
      colors.glow
    )}>
      {/* Background glow orb */}
      <div className={cn("absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500", colors.dot)} />
      
      {/* Top row */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">{title}</p>
          <p className={cn(
            "text-4xl font-black mt-2 bg-gradient-to-br bg-clip-text text-transparent",
            colors.value
          )}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-slate-600 mt-1.5">{description}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2.5 text-xs font-medium",
              trend.value >= 0 ? "text-emerald-400" : "text-rose-400"
            )}>
              {trend.value >= 0
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110", colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom mini bar */}
      <div className="mt-4 h-1 rounded-full bg-slate-800 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", colors.bar)} style={{ width: `${Math.min(100, (Number(value) / 50) * 100)}%` }} />
      </div>
    </div>
  );
}
