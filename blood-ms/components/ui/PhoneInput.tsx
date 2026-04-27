"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Phone } from "lucide-react";
import { COUNTRY_CODES, CountryCode } from "@/lib/countryCodes";

interface PhoneInputProps {
  value?: string;
  onChange?: (fullNumber: string) => void;
  error?: string;
  label?: string;
}

// Default to India (+91)
const DEFAULT = COUNTRY_CODES.find((c) => c.code === "IN") ?? COUNTRY_CODES[0];

export default function PhoneInput({ value = "", onChange, error, label = "Contact Number" }: PhoneInputProps) {
  // Parse initial value to separate dial code from number
  const parseInitial = () => {
    const match = COUNTRY_CODES.find((c) => value.startsWith(c.dial));
    if (match) return { country: match, number: value.slice(match.dial.length).replace(/\D/g, "") };
    return { country: DEFAULT, number: value.replace(/\D/g, "").slice(0, 10) };
  };

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CountryCode>(parseInitial().country);
  const [number, setNumber] = useState(parseInitial().number);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search)
  );

  // Emit combined value upward whenever either part changes
  useEffect(() => {
    onChange?.(`${selected.dial}${number}`);
  }, [selected, number]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only digits, max 10
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setNumber(digits);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>

      <div className={`flex rounded-xl border transition-all duration-200 ${
        error
          ? "border-rose-500/60 bg-rose-500/5"
          : "border-slate-700 bg-slate-800/50 focus-within:border-rose-500/60 focus-within:bg-slate-800/80"
      }`}>

        {/* Country Code Dropdown Trigger */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 h-full px-3 py-3 rounded-l-xl text-sm font-medium text-slate-200 hover:bg-slate-700/40 transition-colors border-r border-slate-700/60 focus:outline-none"
          >
            <span className="text-lg leading-none">{selected.flag}</span>
            <span className="text-slate-300 font-mono text-xs">{selected.dial}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-slate-800">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/70">
                  <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
              {/* List */}
              <ul className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-4 py-3 text-slate-500 text-sm text-center">No results</li>
                ) : (
                  filtered.map((c) => (
                    <li key={c.code}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(c);
                          setOpen(false);
                          setSearch("");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-800/70 transition-colors text-left ${
                          selected.code === c.code ? "bg-rose-500/10 text-rose-300" : "text-slate-300"
                        }`}
                      >
                        <span className="text-base">{c.flag}</span>
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="text-slate-500 font-mono text-xs shrink-0">{c.dial}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Number input */}
        <div className="flex-1 flex items-center">
          <input
            type="tel"
            inputMode="numeric"
            placeholder="10-digit number"
            value={number}
            onChange={handleNumberChange}
            maxLength={10}
            className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-500 outline-none"
          />
          <span className="text-slate-600 text-xs pr-3 shrink-0 tabular-nums">{number.length}/10</span>
        </div>
      </div>

      {error && <p className="text-rose-400 text-xs flex items-center gap-1">{error}</p>}
    </div>
  );
}
