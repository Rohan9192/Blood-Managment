"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import RequestCard from "@/components/requests/RequestCard";
import RequestForm from "@/components/requests/RequestForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { FileText, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function RequestsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["requests", statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "9", status: statusFilter });
      const res = await fetch(`/api/requests?${params}`);
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
  });

  const createMsg = useMutation({
    mutationFn: async (reqData: any) => {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(JSON.parse(text).error || "Failed to create request");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Blood request posted successfully");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const canRequest = session?.user?.role === "RECEIVER" || session?.user?.role === "ADMIN";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-950/40 rounded-xl flex items-center justify-center border border-blue-900/50">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Blood Requests</h1>
            <p className="text-slate-400">View urgent requirements or post a new request.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "FULFILLED", label: "Fulfilled" },
            ]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-40"
          />
          {canRequest && (
            <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" /> New Request
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <div className="text-center py-12 text-red-400 bg-red-950/20 rounded-2xl border border-red-900/50">
          Error loading requests. Please try again.
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : data?.requests.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No active requests</h3>
          <p className="text-slate-400">There are currently no blood requests matching your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {data?.requests.map((req: any) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
          {data?.pagination && (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Blood Request">
        <RequestForm onSubmit={async (data) => createMsg.mutateAsync(data)} isSubmitting={createMsg.isPending} />
      </Modal>
    </div>
  );
}
