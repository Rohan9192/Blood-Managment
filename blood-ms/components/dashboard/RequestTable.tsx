import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SmartMatchPanel from "@/components/dashboard/SmartMatchPanel";
import { formatDate, getBloodGroupLabel, getStatusColor, getUrgencyColor } from "@/lib/utils";

interface RequestTableProps {
  requests: any[];
  onUpdateStatus?: (id: string, status: string) => void;
  loadingId?: string | null;
  isAdmin?: boolean;
}

export default function RequestTable({ requests, onUpdateStatus, loadingId, isAdmin }: RequestTableProps) {
  if (!requests.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No requests found.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-medium">Requesters</th>
              <th className="px-6 py-4 font-medium">Details</th>
              <th className="px-6 py-4 font-medium">Urgency</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
              {isAdmin && <th className="px-6 py-4 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {requests.map((req) => (
              <>
                <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{req.requester?.name || "Unknown"}</div>
                    <div className="text-xs text-slate-500">{req.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="blood">{getBloodGroupLabel(req.bloodGroup)}</Badge>
                      <span className="text-slate-400">{req.units} Units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(req.urgency)}`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{formatDate(req.createdAt)}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <select
                        className="bg-slate-800 border fill-slate-800 border-slate-700 text-slate-300 text-xs rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2"
                        value={req.status}
                        disabled={loadingId === req.id || req.status === "FULFILLED"}
                        onChange={(e) => onUpdateStatus?.(req.id, e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="FULFILLED">Fulfilled</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>
                  )}
                </tr>
                {isAdmin && req.status === "PENDING" && (
                  <tr key={`${req.id}-match`} className="bg-slate-950/30">
                    <td colSpan={6} className="px-6 pb-4">
                      <SmartMatchPanel
                        requestId={req.id}
                        bloodGroup={req.bloodGroup}
                        units={req.units}
                        location={req.location}
                      />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

