"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Droplets, Plus, Minus, Save, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { BLOOD_GROUPS } from "@/lib/constants";

type StockEntry = { bloodGroup: string; unitsAvailable: number };

const LEVEL = (units: number) => {
  if (units === 0)  return { color: "text-red-400",    bg: "bg-red-500/10",   border: "border-red-500/30",   bar: "bg-red-500" };
  if (units < 10)   return { color: "text-red-400",    bg: "bg-red-500/10",   border: "border-red-500/30",   bar: "bg-red-500" };
  if (units < 25)   return { color: "text-amber-400",  bg: "bg-amber-500/10", border: "border-amber-500/30", bar: "bg-amber-400" };
  if (units < 50)   return { color: "text-blue-400",   bg: "bg-blue-500/10",  border: "border-blue-500/30",  bar: "bg-blue-500" };
  return              { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "bg-emerald-500" };
};

export default function BloodStockManager() {
  const queryClient = useQueryClient();
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [manualValues, setManualValues] = useState<Record<string, string>>({});

  const { data: stock, isLoading, isFetching, refetch } = useQuery<StockEntry[]>({
    queryKey: ["adminStockManager"],
    queryFn: async () => {
      const res = await fetch("/api/blood-stock");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const updateStock = useMutation({
    mutationFn: async ({ bloodGroup, units, operation }: { bloodGroup: string; units: number; operation: string }) => {
      const res = await fetch("/api/blood-stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bloodGroup, units, operation }),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Stock updated");
      queryClient.invalidateQueries({ queryKey: ["adminStockManager"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["homeBloodStock"] });
      queryClient.invalidateQueries({ queryKey: ["publicBloodStock"] });
      setAdjustments({});
      setManualValues({});
    },
    onError: () => toast.error("Failed to update stock"),
  });

  const adjust = (bg: string, delta: number) => {
    setAdjustments(prev => ({ ...prev, [bg]: (prev[bg] ?? 0) + delta }));
  };

  const applyAdjustment = (bg: string) => {
    const adj = adjustments[bg] ?? 0;
    if (adj === 0) return;
    updateStock.mutate({
      bloodGroup: bg,
      units: Math.abs(adj),
      operation: adj > 0 ? "increment" : "decrement",
    });
  };

  const setManual = (bg: string) => {
    const val = parseInt(manualValues[bg] ?? "");
    if (isNaN(val) || val < 0) { toast.error("Enter a valid number"); return; }
    updateStock.mutate({ bloodGroup: bg, units: val, operation: "set" });
  };

  const ORDER = ["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG"];
  const sorted = ORDER.map(bg => stock?.find(s => s.bloodGroup === bg) ?? { bloodGroup: bg, unitsAvailable: 0 });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-rose-400" />
          <h3 className="text-lg font-semibold text-white">Blood Stock Management</h3>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {sorted.map((entry) => {
            const label = entry.bloodGroup.replace("_"," ").replace("POS","+").replace("NEG","−");
            const cfg = LEVEL(entry.unitsAvailable);
            const adj = adjustments[entry.bloodGroup] ?? 0;
            const preview = Math.max(0, entry.unitsAvailable + adj);
            const pct = Math.min((preview / 50) * 100, 100);

            return (
              <div key={entry.bloodGroup} className={`rounded-2xl border p-4 space-y-3 ${cfg.bg} ${cfg.border}`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-white font-black text-xl">{label}</span>
                  <span className={`text-2xl font-black ${cfg.color}`}>{preview}</span>
                </div>

                {/* Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
                </div>

                {/* Quick adjust */}
                <div className="flex items-center gap-2">
                  <button onClick={() => adjust(entry.bloodGroup, -1)} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-sm font-bold">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className={`flex-1 text-center text-sm font-bold ${adj > 0 ? "text-emerald-400" : adj < 0 ? "text-red-400" : "text-slate-500"}`}>
                    {adj > 0 ? `+${adj}` : adj < 0 ? adj : "0"}
                  </span>
                  <button onClick={() => adjust(entry.bloodGroup, 1)} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                    <Plus className="w-3 h-3" />
                  </button>
                  {adj !== 0 && (
                    <button onClick={() => applyAdjustment(entry.bloodGroup)} className="w-8 h-8 rounded-lg bg-rose-600 hover:bg-rose-500 flex items-center justify-center transition-all">
                      <Save className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                </div>

                {/* Manual set */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="Set exact"
                    value={manualValues[entry.bloodGroup] ?? ""}
                    onChange={e => setManualValues(prev => ({ ...prev, [entry.bloodGroup]: e.target.value }))}
                    className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-slate-950/60 border border-slate-700 text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    onClick={() => setManual(entry.bloodGroup)}
                    disabled={!manualValues[entry.bloodGroup]}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all disabled:opacity-40"
                  >
                    Set
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-slate-600 text-xs">
        Use +/− to adjust relative to current stock, or "Set exact" to define an absolute value. All changes sync to the public blood availability page instantly.
      </p>
    </div>
  );
}
