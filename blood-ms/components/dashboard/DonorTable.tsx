import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate, getBloodGroupLabel, getStatusColor } from "@/lib/utils";

interface DonorTableProps {
  donors: any[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  loadingId?: string | null;
  isAdmin?: boolean;
}

export default function DonorTable({ donors, onApprove, onReject, loadingId, isAdmin }: DonorTableProps) {
  if (!donors.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No donors found.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Blood Group</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Status</th>
              {isAdmin && <th className="px-6 py-4 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {donors.map((donor) => (
              <tr key={donor.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{donor.user?.name || "Unknown"}</div>
                  <div className="text-xs text-slate-500">{donor.user?.email}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="blood">{getBloodGroupLabel(donor.bloodGroup)}</Badge>
                </td>
                <td className="px-6 py-4 text-slate-300">{donor.location}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(donor.status)}`}>
                    {donor.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right space-x-2">
                    {donor.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onApprove?.(donor.userId)}
                          disabled={loadingId === donor.userId}
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onReject?.(donor.userId)}
                          disabled={loadingId === donor.userId}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
