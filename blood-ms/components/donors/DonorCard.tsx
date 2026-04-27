import { MapPin, Phone, User, PhoneCall, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { getBloodGroupLabel } from "@/lib/utils";
import { BLOOD_COMPATIBILITY } from "@/lib/constants";

interface DonorCardProps {
  donor: {
    id: string;
    bloodGroup: string;
    location: string;
    contactNumber?: string;
    user: {
      name: string;
      email: string;
    };
  };
  /** When set, shows whether this donor is exactly matched or only compatible */
  requestedBloodGroup?: string;
}

export default function DonorCard({ donor, requestedBloodGroup }: DonorCardProps) {
  // Determine if this card is exact match, compatible, or unrelated
  const isExact = requestedBloodGroup
    ? donor.bloodGroup === requestedBloodGroup
    : false;
  const isCompatible = requestedBloodGroup && !isExact
    ? (BLOOD_COMPATIBILITY[requestedBloodGroup] ?? []).includes(donor.bloodGroup)
    : false;

  return (
    <Card hover className="flex flex-col h-full relative overflow-hidden group">
      {/* Decorative Blob */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all duration-500" />

      {/* Compatible / Exact match ribbon */}
      {isExact && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-rose-500/20 border border-rose-500/40 text-rose-300">
          <CheckCircle2 className="w-3 h-3" />
          Exact Match
        </div>
      )}
      {isCompatible && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-violet-500/20 border border-violet-500/40 text-violet-300">
          <CheckCircle2 className="w-3 h-3" />
          Compatible
        </div>
      )}

      <div className="p-6 flex flex-col flex-1 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <User className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">{donor.user.name}</h3>
              <p className="text-xs text-slate-500">{donor.user.email}</p>
            </div>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              isExact
                ? "bg-rose-500/20 border border-rose-500/40 shadow-rose-950/20"
                : isCompatible
                ? "bg-violet-500/15 border border-violet-500/30 shadow-violet-950/20"
                : "bg-rose-950/40 border border-rose-900/50 shadow-rose-950/20"
            }`}
          >
            <span
              className={`font-bold text-lg ${
                isExact ? "text-rose-300" : isCompatible ? "text-violet-300" : "text-rose-400"
              }`}
            >
              {getBloodGroupLabel(donor.bloodGroup)}
            </span>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>{donor.location}</span>
          </div>
          {donor.contactNumber && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>{donor.contactNumber}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center">
          <Badge variant="success">Available</Badge>
          <a
            href={`tel:${donor.contactNumber}`}
            className="flex items-center gap-1.5 text-sm font-medium text-rose-400 hover:text-rose-300 group/btn transition-colors"
          >
            <PhoneCall className="w-4 h-4 group-hover/btn:animate-pulse" />
            Contact
          </a>
        </div>
      </div>
    </Card>
  );
}
