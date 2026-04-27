"use client";
import { MapPin, Calendar, AlertCircle, Droplets, TrendingDown } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate, getBloodGroupLabel, getStatusColor, getUrgencyColor, getCompatibleGroups } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface RequestCardProps {
  request: {
    id: string;
    bloodGroup: string;
    units: number;
    urgency: string;
    location: string;
    status: string;
    notes?: string | null;
    createdAt: string;
    requester: {
      name: string;
      email: string;
    };
  };
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function RequestCard({ request }: RequestCardProps) {
  // Fetch blood stock to show compatibility info
  const { data: stock } = useQuery<{ bloodGroup: string; unitsAvailable: number }[]>({
    queryKey: ["publicBloodStock"],
    queryFn: async () => {
      const res = await fetch("/api/blood-stock");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 60_000,
  });

  // Compatible blood groups for this request
  const compatibleGroups = getCompatibleGroups(request.bloodGroup);
  const compatibleStock = stock
    ? stock.filter(s => compatibleGroups.includes(s.bloodGroup)).reduce((sum, s) => sum + s.unitsAvailable, 0)
    : null;
  const exactStock = stock
    ? stock.find(s => s.bloodGroup === request.bloodGroup)?.unitsAvailable ?? 0
    : null;
  const canFulfill = exactStock !== null && exactStock >= request.units;

  return (
    <Card hover className="flex flex-col h-full bg-slate-900 border-slate-800 relative overflow-hidden group">
      {request.urgency === "CRITICAL" && (
        <div className="absolute top-0 right-0 p-1 bg-red-500/20 rounded-bl-xl border-b border-l border-red-500/30">
          <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2 items-center">
            <Badge variant="blood" className="text-sm px-3 py-1 scale-110 origin-left">
              {getBloodGroupLabel(request.bloodGroup)}
            </Badge>
            <span className="text-slate-400 font-medium text-sm">{request.units} Units</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <UserIcon className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="font-medium text-white truncate">{request.requester.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">{request.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Posted {formatDate(request.createdAt)}</span>
          </div>
        </div>

        {request.notes && (
          <div className="mb-4 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-400 italic">
            "{request.notes}"
          </div>
        )}

        {/* Blood stock availability indicator */}
        {stock && exactStock !== null && (
          <div className={`mb-4 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium ${
            canFulfill
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
              : exactStock === 0
              ? "bg-red-950/30 border-red-500/30 text-red-400"
              : "bg-amber-950/30 border-amber-500/30 text-amber-400"
          }`}>
            {canFulfill ? (
              <Droplets className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {canFulfill
                ? `✓ ${exactStock} units in stock — can fulfill`
                : exactStock === 0
                ? `${getBloodGroupLabel(request.bloodGroup)} out of stock`
                : `Only ${exactStock}/${request.units} units available`}
            </span>
            {compatibleStock !== null && compatibleStock > 0 && !canFulfill && (
              <span className="ml-auto text-slate-400 whitespace-nowrap">
                {compatibleStock} compatible
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
            {request.urgency}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
        </div>
      </div>
    </Card>
  );
}
