"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Brain, Zap, Mail, CheckCircle, XCircle, Clock, Star } from "lucide-react";
import toast from "react-hot-toast";

type DonorMatch = {
  id: string;
  name: string;
  email: string;
  bloodGroup: string;
  location: string;
  age: number;
  totalDonations: number;
  daysSinceLastDonation: number;
  isExactMatch: boolean;
  score: number;
};

type MatchData = {
  requestBloodGroup: string;
  compatibleGroups: string[];
  matches: DonorMatch[];
};

type Props = {
  requestId: string;
  bloodGroup: string;
  units: number;
  location: string;
};

export default function SmartMatchPanel({ requestId, bloodGroup, units, location }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showPanel, setShowPanel] = useState(false);

  const { data, isLoading, refetch } = useQuery<MatchData>({
    queryKey: ["donorMatches", requestId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/requests/${requestId}/matches`);
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    },
    enabled: showPanel,
  });

  const broadcastMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      const res = await fetch(`/api/admin/requests/${requestId}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donorEmails: emails, bloodGroup, units, location }),
      });
      if (!res.ok) throw new Error("Broadcast failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setSelected(new Set());
    },
    onError: () => toast.error("Failed to send broadcast"),
  });

  const toggleSelect = (email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const selectAll = () => {
    if (!data) return;
    setSelected(new Set(data.matches.map((d) => d.email)));
  };

  const handleBroadcast = () => {
    if (selected.size === 0) return toast.error("Select at least one donor");
    broadcastMutation.mutate([...selected]);
  };

  return (
    <div className="mt-4">
      {!showPanel ? (
        <button
          onClick={() => { setShowPanel(true); refetch(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 text-sm font-medium hover:bg-violet-500/25 transition-all"
        >
          <Brain className="w-4 h-4" />
          Smart Donor Matching
        </button>
      ) : (
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-5 mt-2 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              <h4 className="text-white font-semibold">Smart Donor Matches</h4>
              {data && (
                <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
                  {data.matches.length} found
                </span>
              )}
            </div>
            <button onClick={() => setShowPanel(false)} className="text-slate-400 hover:text-white">
              <XCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Compatible groups */}
          {data && (
            <div className="flex flex-wrap gap-2">
              {data.compatibleGroups.map((g) => (
                <span key={g} className={`text-xs px-2 py-1 rounded-lg font-mono ${g === data.requestBloodGroup ? "bg-rose-500/25 text-rose-300 ring-1 ring-rose-500/50" : "bg-slate-800 text-slate-400"}`}>
                  {g.replace("_", " ")} {g === data.requestBloodGroup ? "★" : ""}
                </span>
              ))}
            </div>
          )}

          {/* Donor list */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : data?.matches.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              No eligible donors found for this blood group.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {data?.matches.map((donor) => (
                <label
                  key={donor.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selected.has(donor.email)
                      ? "border-violet-500/60 bg-violet-500/10"
                      : "border-slate-700/50 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(donor.email)}
                    onChange={() => toggleSelect(donor.email)}
                    className="accent-violet-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium truncate">{donor.name}</span>
                      {donor.isExactMatch && (
                        <span className="text-xs bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">Exact</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-slate-400 text-xs">{donor.bloodGroup.replace("_", " ")}</span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="text-slate-400 text-xs">{donor.location}</span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {donor.daysSinceLastDonation === 999 ? "Never donated" : `${donor.daysSinceLastDonation}d ago`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400">{donor.totalDonations}</span>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Action bar */}
          {data && data.matches.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <button onClick={selectAll} className="text-xs text-slate-400 hover:text-white transition-colors">
                Select all ({data.matches.length})
              </button>
              <button
                onClick={handleBroadcast}
                disabled={selected.size === 0 || broadcastMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Zap className="w-4 h-4" />
                {broadcastMutation.isPending ? "Sending..." : `Broadcast to ${selected.size}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
