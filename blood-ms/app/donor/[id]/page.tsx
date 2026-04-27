"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Droplets, MapPin, Phone, Calendar, Shield, Award,
  CheckCircle, XCircle, Clock, Syringe, LogIn, ExternalLink, User,
} from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import toast from "react-hot-toast";
import { useEffect } from "react";

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
  const router = useRouter();
  const isAdmin = session?.user?.role === "ADMIN";

  // When admin logs in via callbackUrl and lands here, they already have session — no redirect needed
  // The page is fully self-contained.

  // Public donor data
  const { data: donor, isLoading, isError } = useQuery({
    queryKey: ["publicDonor", donorId],
    queryFn: async () => {
      const res = await fetch(`/api/donors/public/${donorId}`);
      if (!res.ok) throw new Error("Donor not found");
      return res.json();
    },
    enabled: !!donorId,
    staleTime: 30_000,
  });

  // Admin-only full donor data
  const { data: adminDonor } = useQuery({
    queryKey: ["adminDonorScan", donorId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/donors/${donorId}`);
      if (!res.ok) throw new Error("Not allowed");
      return res.json();
    },
    enabled: !!donorId && isAdmin,
    staleTime: 15_000,
  });

  // Log donation (admin only)
  const logDonation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/donors/${donorId}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to log donation");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("✓ Donation logged & blood stock updated!");
      queryClient.invalidateQueries({ queryKey: ["publicDonor", donorId] });
      queryClient.invalidateQueries({ queryKey: ["adminDonorScan", donorId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Build the login URL — uses the current page path so we come back here after login
  const loginUrl = typeof window !== "undefined"
    ? `/login?callbackUrl=${encodeURIComponent(`/donor/${donorId}`)}`
    : `/login`;

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-rose-500/30 border-t-rose-500 animate-spin" />
        <p className="text-slate-400 text-sm">Verifying donor identity…</p>
      </div>
    );
  }

  if (isError || !donor) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-20 h-20 bg-rose-950/40 border border-rose-900/50 rounded-3xl flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Donor Not Found</h1>
          <p className="text-slate-400 text-sm">This QR code is invalid or the donor profile is no longer active.</p>
          <Link href="/" className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-500 transition-colors">
            Go to BloodLink
          </Link>
        </div>
      </div>
    );
  }

  const displayDonor = adminDonor ?? donor;
  const bloodLabel = donor.bloodGroup.replace("_", " ").replace("POS", "+").replace("NEG", "-");
  const gradient = BLOOD_COLORS[donor.bloodGroup] ?? "from-slate-600 to-slate-800";
  const daysSinceLast = donor.lastDonationDate
    ? Math.floor((Date.now() - new Date(donor.lastDonationDate).getTime()) / 86_400_000)
    : null;
  const canDonate = daysSinceLast === null || daysSinceLast >= 90;
  const isApproved = donor.status === "APPROVED";
  const donationCount = adminDonor?.donationHistory?.length ?? donor.donationHistory?.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start pt-10 pb-20 px-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Brand */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-900/50">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Blood<span className="text-rose-400">Link</span></span>
          </Link>
          <p className="text-slate-500 text-xs mt-2">Donor Identity Verification</p>
        </div>

        {/* Verification status badge */}
        <div className={`flex items-center gap-3 p-3 rounded-2xl border text-sm font-medium ${
          isApproved
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-amber-500/10 border-amber-500/30 text-amber-300"
        }`}>
          {isApproved ? <CheckCircle className="w-5 h-5 shrink-0" /> : <Shield className="w-5 h-5 shrink-0" />}
          {isApproved ? "✓ Verified BloodLink Donor" : "⏳ Pending Verification"}
        </div>

        {/* Donor card */}
        <div className={`relative rounded-3xl bg-gradient-to-br ${gradient} p-px shadow-2xl`}>
          <div className="rounded-3xl bg-slate-950/96 backdrop-blur p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0`}>
                <span className="text-white text-2xl font-black">{bloodLabel}</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate">{displayDonor.user?.name}</h1>
                <p className="text-slate-400 text-xs mt-0.5 font-mono">#{donor.id.slice(0, 8).toUpperCase()}</p>
                <span className={`inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${
                  donor.availability ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${donor.availability ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                  {donor.availability ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {donor.location && (
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{donor.location}</span>
                </div>
              )}
              {donor.contactNumber && (
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{donor.contactNumber}</span>
                </div>
              )}
              {donor.age && (
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{donor.age} years old</span>
                </div>
              )}
              {donor.lastDonationDate && (
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Last donation: {new Date(donor.lastDonationDate).toLocaleDateString("en-IN")}</span>
                </div>
              )}
            </div>

            {/* Eligibility */}
            <div className={`rounded-2xl p-3.5 border ${
              canDonate ? "border-emerald-500/30 bg-emerald-500/8" : "border-amber-500/30 bg-amber-500/8"
            }`}>
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 shrink-0 ${canDonate ? "text-emerald-400" : "text-amber-400"}`} />
                <p className={`text-sm font-semibold ${canDonate ? "text-emerald-300" : "text-amber-300"}`}>
                  {canDonate ? "Eligible to Donate" : "Not Yet Eligible"}
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-6">
                {daysSinceLast === null
                  ? "No prior donation recorded — fully eligible."
                  : canDonate
                  ? `Last donated ${daysSinceLast} days ago. 90-day interval satisfied.`
                  : `Must wait ${90 - daysSinceLast} more days (donated ${daysSinceLast} days ago).`}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-2xl p-3 text-center">
                <p className="text-white font-black text-2xl">{donationCount}</p>
                <p className="text-slate-500 text-xs mt-0.5">Donations</p>
              </div>
              <div className={`rounded-2xl p-3 text-center ${
                isApproved ? "bg-emerald-500/10" : "bg-amber-500/10"
              }`}>
                <p className={`font-bold text-sm ${isApproved ? "text-emerald-400" : "text-amber-400"}`}>
                  {donor.status}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ADMIN PANEL ── */}
        {isAdmin && (
          <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-300 font-semibold text-sm">
                <Shield className="w-4 h-4" />
                Admin Controls
              </div>
              <Link
                href={`/admin/donor/${donorId}`}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-300 transition-colors"
              >
                Full profile <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Recent history preview */}
            {adminDonor?.donationHistory?.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {adminDonor.donationHistory.slice(0, 4).map((h: any) => (
                  <div key={h.id} className="flex justify-between text-xs px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="text-slate-300">{h.units} Unit{h.units !== 1 ? "s" : ""}</span>
                    <span className="text-slate-500">{new Date(h.donatedAt).toLocaleDateString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action */}
            {isApproved && canDonate ? (
              <button
                onClick={() => logDonation.mutate()}
                disabled={logDonation.isPending}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25"
              >
                <Syringe className="w-5 h-5" />
                {logDonation.isPending ? "Recording…" : "Log Donation Now"}
              </button>
            ) : (
              <div className="text-center text-amber-400 text-sm py-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                {!isApproved ? "Donor is not approved yet." : "Not eligible yet — 90 day interval not met."}
              </div>
            )}
          </div>
        )}

        {/* ── SIGN-IN PANEL (non-admin) ── */}
        {!isAdmin && sessionStatus !== "loading" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white text-sm font-semibold">Hospital / Blood Bank Staff?</p>
                <p className="text-slate-500 text-xs mt-0.5">Sign in as Admin to record a donation</p>
              </div>
              <Link
                href={loginUrl}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-colors shrink-0 shadow-lg shadow-rose-900/30 whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          </div>
        )}

        <p className="text-center text-slate-700 text-xs pt-1">
          BloodLink · Verified Donor Profile · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
