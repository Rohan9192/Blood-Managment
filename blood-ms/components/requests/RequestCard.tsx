import { MapPin, Calendar, Clock, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate, getBloodGroupLabel, getStatusColor, getUrgencyColor } from "@/lib/utils";

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

export default function RequestCard({ request }: RequestCardProps) {
  return (
    <Card hover className="flex flex-col h-full bg-slate-900 border-slate-800 relative overflow-hidden group">
      {request.urgency === "CRITICAL" && (
             <div className="absolute top-0 right-0 p-1 bg-red-500/20 rounded-bl-xl border-b border-l border-red-500/30">
                 <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
             </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex gap-2 items-center mb-2">
              <Badge variant="blood" className="text-sm px-3 py-1 scale-110 origin-left">
                {getBloodGroupLabel(request.bloodGroup)}
              </Badge>
              <span className="text-slate-400 font-medium">{request.units} Units Required</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <UserIcon className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-white">{request.requester.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>{request.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Posted {formatDate(request.createdAt)}</span>
          </div>
        </div>

        {request.notes && (
          <div className="mb-6 p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-400 italic">
            "{request.notes}"
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
               {request.urgency} Urgency
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                {request.status}
            </span>
        </div>
      </div>
    </Card>
  );
}

// Inline UserIcon to avoid importing if not available in lucide export for some reason, though it should be.
function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
