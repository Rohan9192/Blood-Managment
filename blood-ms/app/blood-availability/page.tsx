"use client";
import { useQuery } from "@tanstack/react-query";
import { Droplets, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { BLOOD_COMPATIBILITY } from "@/lib/constants";
import { getBloodGroupLabel } from "@/lib/utils";

type StockEntry = { bloodGroup: string; unitsAvailable: number };

const BLOOD_GROUP_ORDER = ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"];

const LEVEL_CONFIG = (units: number) => {
  if (units === 0)  return { label: "Out of Stock", color: "text-red-400",   bg: "bg-red-500/10",   border: "border-red-500/30",   bar: "bg-red-500",    icon: "🚨", pct: 0 };
  if (units < 10)   return { label: "Critical",     color: "text-red-400",   bg: "bg-red-500/10",   border: "border-red-500/30",   bar: "bg-red-500",    icon: "🔴", pct: Math.min(units/50*100,100) };
  if (units < 25)   return { label: "Low",          color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", bar: "bg-amber-500",  icon: "🟡", pct: Math.min(units/50*100,100) };
  if (units < 50)   return { label: "Moderate",     color: "text-blue-400",  bg: "bg-blue-500/10",  border: "border-blue-500/30",  bar: "bg-blue-500",   icon: "🔵", pct: Math.min(units/50*100,100) };
  return              { label: "Healthy",           color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "bg-emerald-500", icon: "🟢", pct: 100 };
};

export default function BloodAvailabilityPage() {
  const { data: stock, isLoading, dataUpdatedAt, refetch, isFetching } = useQuery<StockEntry[]>({
    queryKey: ["publicBloodStock"],
    queryFn: async () => {
      const res = await fetch("/api/blood-stock");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 60_000, // auto refresh every minute
    staleTime: 30_000,
  });

  // Sort by order
  const sorted = stock
    ? BLOOD_GROUP_ORDER.map(bg => stock.find(s => s.bloodGroup === bg) ?? { bloodGroup: bg, unitsAvailable: 0 })
    : [];

  const totalUnits = sorted.reduce((s, e) => s + e.unitsAvailable, 0);
  const criticalCount = sorted.filter(e => e.unitsAvailable < 10).length;
  const healthyCount  = sorted.filter(e => e.unitsAvailable >= 25).length;
  const lastUpdated   = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("en-IN") : "--";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-rose-950/40 border border-rose-900/50 rounded-2xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Live Blood Availability</h1>
                <p className="text-slate-400 text-sm">Real-time stock levels updated automatically</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Summary strip */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-white">{totalUnits}</p>
            <p className="text-slate-400 text-xs mt-1">Total Units Available</p>
          </div>
          <div className="bg-red-950/30 border border-red-900/40 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-red-400">{criticalCount}</p>
            <p className="text-slate-400 text-xs mt-1">Critical / Out of Stock</p>
          </div>
          <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-emerald-400">{healthyCount}</p>
            <p className="text-slate-400 text-xs mt-1">Well Stocked Groups</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-slate-400">
        {[
          { color: "bg-emerald-500", label: "Healthy (≥50 units)" },
          { color: "bg-blue-500",    label: "Moderate (25–49)" },
          { color: "bg-amber-500",   label: "Low (10–24)" },
          { color: "bg-red-500",     label: "Critical (<10)" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
        <span className="ml-auto text-slate-600 text-xs">Last updated: {lastUpdated}</span>
      </div>

      {/* Stock grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {sorted.map((entry) => {
            const cfg = LEVEL_CONFIG(entry.unitsAvailable);
            const label = entry.bloodGroup.replace("_", " ").replace("POS", "+").replace("NEG", "−");
            return (
              <div
                key={entry.bloodGroup}
                className={`relative rounded-2xl border p-5 flex flex-col gap-3 transition-all ${cfg.bg} ${cfg.border} group hover:scale-[1.02] hover:shadow-lg`}
              >
                {/* Blood group badge */}
                <div className="flex items-start justify-between">
                  <div className="bg-slate-950/80 rounded-xl w-14 h-14 flex items-center justify-center shadow-inner">
                    <span className="font-black text-white text-lg leading-none">{label}</span>
                  </div>
                  <span className="text-lg">{cfg.icon}</span>
                </div>

                {/* Units count */}
                <div>
                  <p className="text-white font-black text-3xl leading-none">{entry.unitsAvailable}</p>
                  <p className="text-slate-400 text-xs mt-1">units available</p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                    style={{ width: `${cfg.pct}%` }}
                  />
                </div>

                {/* Status label */}
                <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Compatibility helper */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-lg font-bold text-white mb-1">Which Blood Group Can Help Me?</h2>
        <p className="text-slate-400 text-sm mb-5">Select your blood group to see who can donate to you and check availability.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BLOOD_GROUP_ORDER.map((bg) => {
            const label = getBloodGroupLabel(bg);
            const compatible = BLOOD_COMPATIBILITY[bg] ?? [];
            const compatibleStock = sorted
              .filter(s => compatible.includes(s.bloodGroup))
              .reduce((sum, s) => sum + s.unitsAvailable, 0);
            const hasStock = compatibleStock > 0;

            return (
              <div key={bg} className={`rounded-2xl border p-4 ${hasStock ? "border-slate-700 bg-slate-800/40" : "border-red-900/40 bg-red-950/20"}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-white text-xl">{label}</span>
                  {hasStock
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : <AlertTriangle className="w-4 h-4 text-red-400" />}
                </div>
                <p className="text-slate-400 text-xs mb-1">Compatible donors:</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {compatible.map(c => {
                    const cEntry = sorted.find(s => s.bloodGroup === c);
                    const cUnits = cEntry?.unitsAvailable ?? 0;
                    return (
                      <span key={c} className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        cUnits > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-500 line-through"
                      }`}>
                        {getBloodGroupLabel(c)}
                      </span>
                    );
                  })}
                </div>
                <p className={`text-xs font-semibold ${hasStock ? "text-emerald-400" : "text-red-400"}`}>
                  {hasStock ? `${compatibleStock} total units` : "No stock available"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/donors"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-rose-900/30"
          >
            Find a Donor
          </Link>
          <Link
            href="/requests"
            className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-white text-sm font-semibold transition-colors"
          >
            Submit a Request
          </Link>
        </div>
      </div>
    </div>
  );
}
