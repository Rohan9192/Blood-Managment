"use client";
import { useEffect, useState } from "react";
import Select from "@/components/ui/Select";
import { BLOOD_GROUPS, BLOOD_COMPATIBILITY } from "@/lib/constants";
import { getBloodGroupLabel } from "@/lib/utils";
import { Search, Dna } from "lucide-react";

interface DonorFiltersProps {
  onFilterChange: (filters: {
    bloodGroup: string;
    location: string;
    compatibleMode: boolean;
  }) => void;
}

export default function DonorFilters({ onFilterChange }: DonorFiltersProps) {
  const [bloodGroup, setBloodGroup] = useState("ALL");
  const [location, setLocation] = useState("");
  const [compatibleMode, setCompatibleMode] = useState(false);

  // Derive compatible groups for the hint text
  const compatibleGroups =
    bloodGroup !== "ALL" && compatibleMode
      ? BLOOD_COMPATIBILITY[bloodGroup] ?? []
      : [];

  // Debounce text input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ bloodGroup, location, compatibleMode });
    }, 400);
    return () => clearTimeout(timer);
  }, [bloodGroup, location, compatibleMode, onFilterChange]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 mb-8 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Location search */}
        <div className="flex-1 relative">
          <label className="sr-only">Search location</label>
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            id="donor-location-search"
            type="text"
            placeholder="Search by city or area..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Blood group selector */}
        <div className="w-full md:w-64">
          <Select
            options={[{ value: "ALL", label: "All Blood Groups" }, ...BLOOD_GROUPS]}
            value={bloodGroup}
            onChange={(e) => {
              setBloodGroup(e.target.value);
              // Reset compatible mode if going back to ALL
              if (e.target.value === "ALL") setCompatibleMode(false);
            }}
            className="py-3"
          />
        </div>
      </div>

      {/* Compatible mode toggle — only shown when a specific blood group is selected */}
      {bloodGroup !== "ALL" && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
          <button
            id="compatible-mode-toggle"
            type="button"
            onClick={() => setCompatibleMode((v) => !v)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
              compatibleMode
                ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
            }`}
          >
            <Dna className="w-4 h-4" />
            {compatibleMode ? "Showing compatible donors" : "Show compatible donors"}
            <span
              className={`ml-1 w-8 h-4 rounded-full relative inline-block transition-colors duration-200 ${
                compatibleMode ? "bg-violet-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
                  compatibleMode ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </span>
          </button>

          {/* Compatible groups hint */}
          {compatibleMode && compatibleGroups.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 text-xs">Accepting from:</span>
              {compatibleGroups.map((g) => (
                <span
                  key={g}
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                    g === bloodGroup
                      ? "bg-rose-950/50 border-rose-700/50 text-rose-300"
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  {getBloodGroupLabel(g)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
