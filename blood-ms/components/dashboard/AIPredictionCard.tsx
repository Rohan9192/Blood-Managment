"use client";
import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Zap, Shield, CheckCircle, RefreshCw } from "lucide-react";

type Prediction = {
  bloodGroup: string;
  currentStock: number;
  predictedWeeklyDemand: number;
  avgDailyDemand: number;
  daysOfSupply: number | null;
  trend: "INCREASING" | "DECREASING" | "STABLE";
  risk: "CRITICAL" | "HIGH" | "MODERATE" | "SAFE";
  totalRequestsLast30Days: number;
};

const riskConfig = {
  CRITICAL: { color: "text-rose-400",   bg: "bg-rose-500/10",    border: "border-rose-500/30",    icon: Zap,           label: "Critical" },
  HIGH:     { color: "text-amber-400",  bg: "bg-amber-500/10",   border: "border-amber-500/30",   icon: AlertTriangle, label: "High Risk" },
  MODERATE: { color: "text-blue-400",   bg: "bg-blue-500/10",    border: "border-blue-500/30",    icon: Shield,        label: "Moderate" },
  SAFE:     { color: "text-emerald-400",bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle,   label: "Safe" },
};

const trendConfig = {
  INCREASING: { icon: TrendingUp,   color: "text-rose-400",    label: "Rising" },
  DECREASING: { icon: TrendingDown, color: "text-emerald-400", label: "Falling" },
  STABLE:     { icon: Minus,        color: "text-slate-400",   label: "Stable" },
};

export default function AIPredictionCard() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["aiPredictions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/predict");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ predictions: Prediction[]; generatedAt: string }>;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const criticalCount = data?.predictions.filter((p) => p.risk === "CRITICAL").length ?? 0;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">AI Demand Prediction</h3>
            <p className="text-slate-500 text-xs">7-day forecast · Linear regression model</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-rose-400 text-xs font-medium">{criticalCount} critical</span>
            </div>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {data?.predictions.map((p) => {
            const risk    = riskConfig[p.risk];
            const trend   = trendConfig[p.trend];
            const TrendIcon = trend.icon;
            const RiskIcon  = risk.icon;
            const bgWidth = Math.min(100, (p.currentStock / Math.max(p.predictedWeeklyDemand, 1)) * 100);
            const label = p.bloodGroup.replace("_", " ").replace("POS", "+").replace("NEG", "−");

            return (
              <div key={p.bloodGroup}
                className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${risk.bg} ${risk.border}`}>

                {/* Blood group pill */}
                <div className="w-14 text-center shrink-0">
                  <span className={`text-sm font-black ${risk.color}`}>{label}</span>
                </div>

                {/* Stock vs demand bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Stock: <strong className="text-white">{p.currentStock}</strong> units</span>
                    <span className="text-slate-500">7d forecast: <strong className={risk.color}>{p.predictedWeeklyDemand}</strong></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        p.risk === "CRITICAL" ? "bg-rose-500" :
                        p.risk === "HIGH"     ? "bg-amber-500" :
                        p.risk === "MODERATE" ? "bg-blue-500"  : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(bgWidth, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-[10px]">
                      {p.daysOfSupply === null ? "Abundant supply" : `~${p.daysOfSupply} days of supply`}
                    </span>
                  </div>
                </div>

                {/* Trend */}
                <div className="flex items-center gap-1 shrink-0">
                  <TrendIcon className={`w-3.5 h-3.5 ${trend.color}`} />
                  <span className={`text-xs font-medium ${trend.color}`}>{trend.label}</span>
                </div>

                {/* Risk badge */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg shrink-0 ${risk.bg}`}>
                  <RiskIcon className={`w-3 h-3 ${risk.color}`} />
                  <span className={`text-[10px] font-bold ${risk.color}`}>{risk.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data && (
        <p className="text-slate-600 text-xs mt-4 text-right">
          Based on 30-day history · Generated {new Date(data.generatedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
