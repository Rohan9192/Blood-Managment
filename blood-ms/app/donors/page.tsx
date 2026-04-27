"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DonorFilters from "@/components/donors/DonorFilters";
import DonorCard from "@/components/donors/DonorCard";
import Pagination from "@/components/ui/Pagination";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Users } from "lucide-react";

export default function DonorsPage() {
  const [filters, setFilters] = useState({
    bloodGroup: "ALL",
    location: "",
    compatibleMode: false,
  });
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["donors", filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        ...(filters.bloodGroup !== "ALL" && { bloodGroup: filters.bloodGroup }),
        ...(filters.location && { location: filters.location }),
        ...(filters.compatibleMode && { compatible: "true" }),
      });
      const res = await fetch(`/api/donors?${params}`);
      if (!res.ok) throw new Error("Failed to fetch donors");
      return res.json();
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-rose-950/40 rounded-xl flex items-center justify-center border border-rose-900/50">
          <Users className="w-6 h-6 text-rose-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Find Blood Donors</h1>
          <p className="text-slate-400">Search and connect with available donors in your area.</p>
        </div>
      </div>

      <DonorFilters
        onFilterChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />

      {error ? (
        <div className="text-center py-12 text-red-400 bg-red-950/20 rounded-2xl border border-red-900/50">
          Error loading donors. Please try again.
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : data?.donors.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No donors found</h3>
          <p className="text-slate-400">
            {filters.bloodGroup !== "ALL" && !filters.compatibleMode
              ? "Try enabling \"Show compatible donors\" to broaden your search."
              : "Try adjusting your search criteria or location."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {data?.donors.map((donor: any) => (
              <DonorCard
                key={donor.id}
                donor={donor}
                requestedBloodGroup={
                  filters.bloodGroup !== "ALL" ? filters.bloodGroup : undefined
                }
              />
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
    </div>
  );
}
