"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
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
              placeholder="Coiffeur, barber, massage, tatoueur..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-xl bg-white/60 sm:bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white/80 transition-colors"
            />
          </div>

          {/* Divider (desktop only) */}
          <div className="hidden sm:block w-px h-8 bg-gray-200/80 mx-1 flex-shrink-0" />

          {/* City input */}
          <div className="relative sm:max-w-[220px] flex-1 group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0066FF] transition-colors" />
            <input
              type="text"
              placeholder="Papeete, Moorea..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-xl bg-white/60 sm:bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white/80 transition-colors"
            />
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
