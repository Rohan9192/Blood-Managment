"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Droplets, User, MapPin, Phone, Calendar, Award, Syringe, ArrowLeft, Shield, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";

export default function AdminDonorScanPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const donorId = params.id as string;

  const { data: donor, isLoading } = useQuery({
    queryKey: ["adminDonor", donorId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/donors/${donorId}`);
      if (!res.ok) throw new Error("Donor not found");
      return res.json();
    },
    enabled: !!donorId && session?.user?.role === "ADMIN",
  });

  const logDonation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/donors/${donorId}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to log donation");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Donation logged successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminDonor", donorId] });
    },
    onError: () => toast.error("Failed to log donation"),
  });

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-rose-400">
        Access Denied: Admin only
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        Donor not found.
      </div>
    );
  }

  const bloodLabel = donor.bloodGroup.replace("_", " ").replace("POS", "+").replace("NEG", "-");
  const daysSinceLast = donor.lastDonationDate
    ? Math.floor((Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const canDonate = !daysSinceLast || daysSinceLast >= 90;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 w-full space-y-6">
      <button
        onClick={() => router.push("/admin")}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Dashboard
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        {/* Scan badge */}
        <div className="flex items-center gap-3 p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-violet-300 text-sm">
          <Shield className="w-4 h-4" />
          Identity verified via QR Code — BloodLink Donor
        </div>

        {/* Profile header */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center shadow-lg shrink-0">
            <span className="text-white font-black text-lg">{bloodLabel}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{donor.user.name}</h1>
            <p className="text-slate-400 text-sm">{donor.user.email}</p>
            <p className="text-slate-500 text-xs font-mono mt-1">{donor.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              donor.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
            }`}>{donor.status}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Blood Group", value: bloodLabel, icon: Droplets },
            { label: "Age", value: donor.age, icon: User },
            { label: "Total Donations", value: donor.donationHistory.length, icon: Award },
            { label: "Location", value: donor.location, icon: MapPin },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-slate-800/50 rounded-2xl p-4">
              <Icon className="w-4 h-4 text-slate-500 mb-2" />
              <p className="text-white font-bold text-lg truncate">{value}</p>
              <p className="text-slate-400 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Health eligibility */}
        <div className={`rounded-2xl p-5 border ${canDonate ? "border-emerald-500/30 bg-emerald-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
          <h3 className={`font-semibold mb-2 ${canDonate ? "text-emerald-300" : "text-amber-300"}`}>
            {canDonate ? "✓ Eligible to Donate" : "⏰ Not Yet Eligible"}
          </h3>
          <p className="text-sm text-slate-300">
            {daysSinceLast === null
              ? "No previous donation on record. Eligible to donate."
              : canDonate
              ? `Last donated ${daysSinceLast} days ago. Health interval met.`
              : `Last donated ${daysSinceLast} days ago. Must wait ${90 - daysSinceLast} more days.`}
          </p>
        </div>

        {/* Donation history */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Donation History
          </h3>
          {donor.donationHistory.length === 0 ? (
            <p className="text-slate-500 text-sm">No donations recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {donor.donationHistory.map((h: any) => (
                <li key={h.id} className="flex justify-between items-center text-sm p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-slate-300">{h.units} Unit{h.units !== 1 ? "s" : ""}</span>
                  <span className="text-slate-500">{new Date(h.donatedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action button */}
        {donor.status === "APPROVED" && canDonate && (
          <button
            onClick={() => logDonation.mutate()}
            disabled={logDonation.isPending}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25"
          >
            <Syringe className="w-5 h-5" />
            {logDonation.isPending ? "Logging Donation..." : "Log Donation Now"}
          </button>
        )}
      </div>
    </div>
  );
}
