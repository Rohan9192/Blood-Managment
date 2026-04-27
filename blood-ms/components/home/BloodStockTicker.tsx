"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

type StockEntry = { bloodGroup: string; unitsAvailable: number };

const LEVEL = (units: number) => {
  if (units === 0)  return { bar: "bg-red-500",    text: "text-red-400",    glow: "shadow-red-500/30" };
  if (units < 10)   return { bar: "bg-red-500",    text: "text-red-400",    glow: "shadow-red-500/20" };
  if (units < 25)   return { bar: "bg-amber-500",  text: "text-amber-400",  glow: "shadow-amber-500/20" };
  if (units < 50)   return { bar: "bg-blue-500",   text: "text-blue-400",   glow: "" };
  return              { bar: "bg-emerald-500", text: "text-emerald-400", glow: "" };
};

const ORDER = ["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG"];

export default function BloodStockTicker() {
  const { data: stock, isLoading } = useQuery<StockEntry[]>({
    queryKey: ["homeBloodStock"],
    queryFn: async () => {
      const res = await fetch("/api/blood-stock");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const sorted = ORDER.map(bg =>
    stock?.find(s => s.bloodGroup === bg) ?? { bloodGroup: bg, unitsAvailable: 0 }
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const criticals = sorted.filter(s => s.unitsAvailable < 10);

  return (
    <div className="space-y-4">
      {/* Critical alert banner */}
      {criticals.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-950/30 border border-red-900/50 rounded-2xl text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
          <span className="text-red-300 font-medium">
            Critical shortage:{" "}
            {criticals.map(c =>
              c.bloodGroup.replace("_"," ").replace("POS","+").replace("NEG","−")
            ).join(", ")} — urgent donors needed!
          </span>
          <Link href="/register" className="ml-auto shrink-0 text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors">
            Donate Now
          </Link>
        </div>
      )}

      {/* Stock grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {sorted.map((entry) => {
          const label = entry.bloodGroup.replace("_"," ").replace("POS","+").replace("NEG","−");
          const cfg = LEVEL(entry.unitsAvailable);
          const pct = Math.min((entry.unitsAvailable / 50) * 100, 100);
          const isCritical = entry.unitsAvailable < 10;

          return (
            <Link
              key={entry.bloodGroup}
              href="/blood-availability"
              className={`group relative flex flex-col items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all hover:shadow-lg ${cfg.glow} ${isCritical ? "ring-1 ring-red-500/30" : ""}`}
            >
              {isCritical && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
              <span className="text-white font-black text-xl">{label}</span>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-sm font-bold ${cfg.text}`}>{entry.unitsAvailable}</span>
              <span className="text-slate-600 text-xs">units</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
