"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import StatsCard from "@/components/dashboard/StatsCard";
import DonorTable from "@/components/dashboard/DonorTable";
import RequestTable from "@/components/dashboard/RequestTable";
import BloodStockChart from "@/components/dashboard/BloodStockChart";
import RequestStatusChart from "@/components/dashboard/RequestStatusChart";
import AIPredictionCard from "@/components/dashboard/AIPredictionCard";
import { StatsSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { Users, FileText, Droplet, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "donors" | "requests">("overview");
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
    enabled: session?.user?.role === "ADMIN",
    refetchInterval: 30000,
  });

  const updateDonorStatus = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: string }) => {
      setLoadingActionId(userId);
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (!res.ok) {
        setLoadingActionId(null);
        throw new Error("Failed to update donor status");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Donor status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      setLoadingActionId(null);
    },
    onError: () => {
      toast.error("Failed to update donor status");
      setLoadingActionId(null);
    },
  });

  const updateRequestStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      setLoadingActionId(id);
      const res = await fetch(`/api/requests/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setLoadingActionId(null);
        throw new Error("Failed to update request status");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Request status updated");
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      setLoadingActionId(null);
    },
    onError: () => {
      toast.error("Failed to update request status. Action reverted.");
      setLoadingActionId(null);
    },
  });

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <h1 className="text-2xl text-red-400">Access Denied: Admin privileges required.</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin <span className="gradient-text">Command Center</span></h1>
          </div>
          <p className="text-slate-500 text-sm">Real-time overview · Manage donors, requests & inventory</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Live</span>
        </div>
      </div>

      {/* Segmented tab control */}
      <div className="flex p-1 bg-slate-900/80 border border-slate-800 rounded-2xl w-fit gap-1">
        {(["overview", "donors", "requests"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab
                ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <StatsSkeleton />
      ) : activeTab === "overview" && stats ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Donors"
              value={stats.totalDonors}
              icon={Users}
              color="blue"
              trend={{ value: 12, label: "this month" }}
            />
            <StatsCard
              title="Total Requests"
              value={stats.totalRequests}
              icon={FileText}
              color="emerald"
            />
            <StatsCard
              title="Pending Approvals"
              value={stats.pendingDonors}
              icon={AlertCircle}
              color="amber"
              description="Donors awaiting verification"
            />
            <StatsCard
              title="Critical Requests"
              value={stats.criticalRequests}
              icon={Droplet}
              color="rose"
              trend={{ value: -5, label: "vs last week" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl h-full">
                <h3 className="text-lg font-semibold text-white mb-6">Live Blood Stock Analysis</h3>
                <BloodStockChart data={stats.bloodStock} />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl h-full flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-white mb-6 w-full text-left">Request Distributions</h3>
                <RequestStatusChart data={stats.requestsByStatus} />
              </div>
            </div>
          </div>

          {/* AI Demand Prediction */}
          <AIPredictionCard />
        </div>
      ) : activeTab === "donors" && stats ? (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
           <h2 className="text-xl font-semibold text-white mb-4">Recent Donor Registrations</h2>
           <DonorTable
             donors={stats.recentDonors}
             isAdmin
             onApprove={(id) => updateDonorStatus.mutate({ userId: id, action: "approve_donor" })}
             onReject={(id) => updateDonorStatus.mutate({ userId: id, action: "reject_donor" })}
             loadingId={loadingActionId}
           />
        </div>
      ) : activeTab === "requests" && stats ? (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <h2 className="text-xl font-semibold text-white mb-4">Recent Blood Requests</h2>
               <RequestTable
                 requests={stats.recentRequests}
                 isAdmin
                 onUpdateStatus={(id, status) => updateRequestStatus.mutate({ id, status })}
                 loadingId={loadingActionId}
               />
             </div>
      ) : null}
    </div>
  );
}
