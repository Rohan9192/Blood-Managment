"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Droplets, MapPin, Phone, Calendar, Shield, Award,
  CheckCircle, XCircle, Clock, Syringe, LogIn, ArrowLeft, User,
} from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import toast from "react-hot-toast";

const BLOOD_COLORS: Record<string, string> = {
  A_POS: "from-rose-600 to-rose-800",
  A_NEG: "from-pink-600 to-pink-800",
  B_POS: "from-blue-600 to-blue-800",
  B_NEG: "from-indigo-600 to-indigo-800",
  AB_POS: "from-violet-600 to-violet-800",
  AB_NEG: "from-purple-600 to-purple-800",
  O_POS: "from-emerald-600 to-emerald-800",
  O_NEG: "from-teal-600 to-teal-800",
};

export default function DonorVerifyPage() {
  const params = useParams();
  const donorId = params.id as string;
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const isAdmin = session?.user?.role === "ADMIN";

  // Public donor data (available to everyone)
  const { data: donor, isLoading, isError } = useQuery({
    queryKey: ["publicDonor", donorId],
    queryFn: async () => {
      const res = await fetch(`/api/donors/public/${donorId}`);
      if (!res.ok) throw new Error("Donor not found");
      return res.json();
    },
    enabled: !!donorId,
  });

  // Admin-only: full donor data (donation history etc.)
  // Only run this query when session is fully resolved AND user is admin
  const { data: adminDonor } = useQuery({
    queryKey: ["adminDonorScan", donorId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/donors/${donorId}`);
      if (!res.ok) throw new Error("Not allowed");
      return res.json();
    },
    enabled: !!donorId && isAdmin && sessionStatus === "authenticated",
  });

  // Admin: log a donation
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
      queryClient.invalidateQueries({ queryKey: ["publicDonor", donorId] });
      queryClient.invalidateQueries({ queryKey: ["adminDonorScan", donorId] });
    },
    onError: () => toast.error("Failed to log donation"),
  });

  const callbackUrl = encodeURIComponent(`/donor/${donorId}`);

  // Only block rendering on donor data loading — NOT session loading.
  // Phones scanning the QR are unauthenticated; blocking on sessionStatus
  // caused an infinite spinner because NextAuth never resolved for them.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !donor) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Donor Not Found</h1>
          <p className="text-slate-400">This QR code is invalid or the donor no longer exists.</p>
          <Link href="/" className="inline-block mt-4 px-6 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-500 transition-colors">
            Go to BloodLink
          </Link>
        </div>
      </div>
    );
  }

  // Use admin donor data if available (has more fields), otherwise use public data
  const displayDonor = adminDonor ?? donor;
  const bloodLabel = donor.bloodGroup.replace("_", " ").replace("POS", "+").replace("NEG", "-");
  const gradient = BLOOD_COLORS[donor.bloodGroup] ?? "from-slate-600 to-slate-800";
  const daysSinceLast = donor.lastDonationDate
    ? Math.floor((Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const canDonate = !daysSinceLast || daysSinceLast >= 90;
  const isApproved = donor.status === "APPROVED";
  const donationCount = adminDonor?.donationHistory?.length ?? donor.donationHistory?.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start pt-10 pb-16 px-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-900/50">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Blood<span className="text-rose-400">Link</span></span>
          </Link>
          <p className="text-slate-500 text-sm mt-2">Donor Identity Verification</p>
        </div>

        {/* Verification badge */}
        <div className={`flex items-center gap-3 p-3 rounded-2xl border text-sm font-medium ${
          isApproved
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-amber-500/10 border-amber-500/30 text-amber-300"
        }`}>
          {isApproved ? <CheckCircle className="w-5 h-5 shrink-0" /> : <Shield className="w-5 h-5 shrink-0" />}
          {isApproved ? "✓ Verified BloodLink Donor" : "⏳ Donor Pending Approval"}
        </div>

        {/* Main card */}
        <div className={`relative rounded-3xl bg-gradient-to-br ${gradient} p-px shadow-2xl overflow-hidden`}>
          <div className="rounded-3xl bg-slate-950/95 backdrop-blur p-6 space-y-5">
            {/* Blood group + name */}
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0`}>
                <span className="text-white text-2xl font-black">{bloodLabel}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{displayDonor.user?.name ?? donor.user?.name}</h1>
                <p className="text-slate-400 text-sm mt-0.5">ID: {donor.id.slice(0, 8).toUpperCase()}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  donor.availability
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-700 text-slate-400"
                }`}>
                  {donor.availability ? "● Available to Donate" : "○ Not Available"}
                </span>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              {donor.location && (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{donor.location}</span>
                </div>
              )}
              {donor.contactNumber && (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{donor.contactNumber}</span>
                </div>
              )}
              {donor.age && (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <User className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{donor.age} years old</span>
                </div>
              )}
              {donor.lastDonationDate && (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Last donation: {new Date(donor.lastDonationDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Eligibility */}
            <div className={`rounded-2xl p-4 border ${
              canDonate ? "border-emerald-500/30 bg-emerald-500/10" : "border-amber-500/30 bg-amber-500/10"
            }`}>
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${canDonate ? "text-emerald-400" : "text-amber-400"}`} />
                <p className={`text-sm font-semibold ${canDonate ? "text-emerald-300" : "text-amber-300"}`}>
                  {canDonate ? "Eligible to Donate" : "Not Yet Eligible"}
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {daysSinceLast === null
                  ? "No previous donation on record."
                  : canDonate
                  ? `Last donated ${daysSinceLast} days ago. Health interval met (90 days).`
                  : `Last donated ${daysSinceLast} days ago. Must wait ${90 - daysSinceLast} more days.`}
              </p>
            </div>

            {/* Donation count */}
            <div className="flex items-center justify-between bg-slate-800/50 rounded-2xl px-5 py-3">
              <span className="text-slate-400 text-sm">Total Donations</span>
              <span className="text-white font-black text-2xl">{donationCount}</span>
            </div>
          </div>
        </div>

        {/* ─── ADMIN PANEL (visible only when signed in as admin) ─── */}
        {isAdmin && (
          <div className="bg-violet-950/40 border border-violet-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-violet-300 font-semibold text-sm">
              <Shield className="w-4 h-4" />
              Admin — Log Donation
            </div>

            {/* Admin: recent donation history */}
            {adminDonor?.donationHistory?.length > 0 && (
              <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                {adminDonor.donationHistory.map((h: any) => (
                  <li key={h.id} className="flex justify-between text-xs px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="text-slate-300">{h.units} Unit{h.units !== 1 ? "s" : ""}</span>
                    <span className="text-slate-500">{new Date(h.donatedAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Log donation button */}
            {isApproved && canDonate ? (
              <button
                id="log-donation-btn"
                onClick={() => logDonation.mutate()}
                disabled={logDonation.isPending}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25"
              >
                <Syringe className="w-5 h-5" />
                {logDonation.isPending ? "Logging..." : "Log Donation Now"}
              </button>
            ) : (
              <div className="text-center text-amber-400 text-sm py-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                {!isApproved ? "Donor is not approved yet." : "Donor is not eligible to donate yet."}
              </div>
            )}

            <Link
              href={`/admin/donor/${donorId}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm text-violet-300 hover:text-white border border-violet-500/30 hover:border-violet-400/50 hover:bg-violet-500/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              Full Admin Profile
            </Link>
          </div>
        )}

        {/* ─── SIGN IN PROMPT (for non-admins / unauthenticated) ─── */}
        {!isAdmin && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-white text-sm font-medium">Hospital / Blood Bank?</p>
              <p className="text-slate-500 text-xs mt-0.5">Sign in as admin to log a donation</p>
            </div>
            <Link
              id="admin-signin-link"
              href={`/login?callbackUrl=${callbackUrl}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors shrink-0 shadow-lg shadow-rose-900/30"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs pt-2">
          Powered by BloodLink · Verified donor profile
        </p>
      </div>
    </div>
  );
}
