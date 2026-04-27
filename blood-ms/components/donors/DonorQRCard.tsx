"use client";
import { QRCodeSVG } from "qrcode.react";
import { Droplets, User, MapPin, Phone, Award, Calendar, Shield } from "lucide-react";

type DonorProfile = {
  name: string;
  email: string;
  donor: {
    id: string;
    bloodGroup: string;
    age: number;
    location: string;
    contactNumber: string;
    availability: boolean;
    status: string;
    donationHistory: { id: string; donatedAt: string }[];
    lastDonationDate: string | null;
  };
};

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

export default function DonorQRCard({ profile }: { profile: DonorProfile }) {
  const { donor } = profile;

  // Use network URL from env so phones on same WiFi can scan it
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const scanUrl = `${baseUrl}/donor/${donor.id}`;

  const bloodLabel = donor.bloodGroup.replace("_", " ").replace("POS", "+").replace("NEG", "-");
  const gradient = BLOOD_COLORS[donor.bloodGroup] ?? "from-slate-600 to-slate-800";

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* ID Card */}
      <div className={`relative rounded-3xl bg-gradient-to-br ${gradient} p-px shadow-2xl overflow-hidden`}>
        <div className="rounded-3xl bg-slate-950/95 backdrop-blur p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-rose-400" />
              <span className="text-white font-bold text-sm tracking-wide">BloodLink</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              donor.availability ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"
            }`}>
              {donor.availability ? "● Available" : "○ Unavailable"}
            </span>
          </div>

          {/* Blood group hero */}
          <div className="text-center py-4">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg mb-3`}>
              <span className="text-white text-2xl font-black">{bloodLabel}</span>
            </div>
            <h2 className="text-white text-xl font-bold">{profile.name}</h2>
            <p className="text-slate-400 text-xs mt-1">{profile.email}</p>
          </div>

          {/* Stats row — divider layout, never overflows */}
          <div className="flex items-stretch bg-slate-800/50 rounded-2xl overflow-hidden divide-x divide-slate-700/60">
            {/* Donations */}
            <div className="flex-1 flex flex-col items-center justify-center py-3 px-1 min-w-0">
              <p className="text-white font-black text-xl leading-none">{donor.donationHistory.length}</p>
              <p className="text-slate-500 text-[10px] mt-1 font-medium tracking-wide uppercase leading-none">Donated</p>
            </div>
            {/* Age */}
            <div className="flex-1 flex flex-col items-center justify-center py-3 px-1 min-w-0">
              <p className="text-white font-black text-xl leading-none">{donor.age}</p>
              <p className="text-slate-500 text-[10px] mt-1 font-medium tracking-wide uppercase leading-none">Age</p>
            </div>
            {/* Status */}
            <div className={`flex-1 flex flex-col items-center justify-center py-3 px-1 min-w-0 ${
              donor.status === "APPROVED" ? "bg-emerald-500/10" : "bg-amber-500/10"
            }`}>
              <Shield className={`w-4 h-4 mb-1 flex-shrink-0 ${
                donor.status === "APPROVED" ? "text-emerald-400" : "text-amber-400"
              }`} />
              <p className={`text-[10px] font-bold tracking-wide leading-none truncate max-w-full px-1 ${
                donor.status === "APPROVED" ? "text-emerald-400" : "text-amber-400"
              }`}>
                {donor.status}
              </p>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">{donor.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Phone className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{donor.contactNumber}</span>
            </div>
            {donor.lastDonationDate && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Last: {new Date(donor.lastDonationDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-800">
            <div className="bg-white p-3 rounded-2xl">
              <QRCodeSVG
                value={scanUrl}
                size={110}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-slate-500 text-xs">Scan to verify donor identity</p>
            <p className="text-slate-600 font-mono text-xs">{donor.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
