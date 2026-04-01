"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";

const COMMUNES_TAHITI = [
  "Papeete",
  "Faa'a",
  "Punaauia",
  "Pirae",
  "Arue",
  "Mahina",
  "Paea",
  "Papara",
  "Taravao",
  "Moorea",
];

export function SearchBar({
  defaultQuery = "",
  defaultCity = "",
}: {
  defaultQuery?: string;
  defaultCity?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [city, setCity] = useState(defaultCity);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter communes based on current input
  const filteredCommunes = city
    ? COMMUNES_TAHITI.filter((c) =>
        c.toLowerCase().includes(city.toLowerCase())
      )
    : COMMUNES_TAHITI;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  }

  function selectCity(c: string) {
    setCity(c);
    setShowDropdown(false);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="glass rounded-2xl shadow-xl p-2 sm:p-2.5">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center">
          {/* Search input */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0066FF] transition-colors" />
            <input
              type="text"
              placeholder="Coiffeur, barber, massage, médecin..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-xl bg-white/60 dark:bg-white/10 sm:bg-transparent text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:bg-white/80 dark:focus:bg-white/15 transition-colors"
            />
          </div>

          {/* Divider (desktop only) */}
          <div className="hidden sm:block w-px h-8 bg-gray-200/80 mx-1 flex-shrink-0" />

          {/* City input with dropdown */}
          <div ref={dropdownRef} className="relative sm:max-w-[220px] flex-1 group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0066FF] transition-colors z-10" />
            <input
              type="text"
              placeholder="Commune..."
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-xl bg-white/60 dark:bg-white/10 sm:bg-transparent text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:bg-white/80 dark:focus:bg-white/15 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {showDropdown && filteredCommunes.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50 max-h-60 overflow-y-auto">
                {filteredCommunes.map((commune) => (
                  <button
                    key={commune}
                    type="button"
                    onClick={() => selectCity(commune)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#0066FF]/5 dark:hover:bg-[#0066FF]/10 transition-colors flex items-center gap-2.5 ${
                      city === commune ? "text-[#0066FF] font-semibold bg-[#0066FF]/5" : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    {commune}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn-press flex-shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00B4D8] hover:from-[#0052CC] hover:to-[#0891B2] text-white font-semibold px-7 py-3.5 sm:py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 text-base"
          >
            <Search className="h-5 w-5" />
            <span>Rechercher</span>
          </button>
        </div>
      </div>
    </form>
  );
}
