import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search/SearchBar";
import { MerchantCard } from "@/components/search/MerchantCard";
import { SearchX, MapIcon, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; sector?: string; city?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { q, sector, city } = params;

  const where: Record<string, unknown> = { isActive: true };

  if (q) {
    where.OR = [
      { businessName: { contains: q } },
      { description: { contains: q } },
    ];
  }

  if (sector) {
    where.sector = { slug: sector };
  }

  if (city) {
    where.city = { contains: city };
  }

  const merchants = await prisma.merchant.findMany({
    where,
    include: {
      sector: true,
      reviews: { select: { rating: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const merchantsWithRating = merchants.map((m) => ({
    ...m,
    avgRating:
      m.reviews.length > 0
        ? m.reviews.reduce((sum, r) => sum + r.rating, 0) / m.reviews.length
        : 0,
  }));

  const sectorName = sector
    ? (await prisma.sector.findUnique({ where: { slug: sector } }))?.name
    : null;

  // Build active filters for display
  const activeFilters: { label: string; param: string; value: string }[] = [];
  if (sectorName) activeFilters.push({ label: sectorName, param: "sector", value: sector! });
  if (city) activeFilters.push({ label: city, param: "city", value: city });
  if (q) activeFilters.push({ label: `"${q}"`, param: "q", value: q });

  // Build map link with current filters
  const mapParams = new URLSearchParams();
  if (q) mapParams.set("q", q);
  if (sector) mapParams.set("sector", sector);
  if (city) mapParams.set("city", city);
  const mapLink = `/map${mapParams.toString() ? `?${mapParams.toString()}` : ""}`;

  return (
    <div className="page-transition min-h-screen bg-[#F8FAFC]">
      {/* Header / Search Section */}
      <div className="relative bg-gradient-to-br from-[#0C1B2A] via-[#0C1B2A] to-[#003D99] overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0066FF]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#00B4D8]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-10">
          <div className="mb-6">
            <SearchBar defaultQuery={q || ""} defaultCity={city || ""} />
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4">
        {/* Results header card */}
        <div className="glass rounded-2xl shadow-lg px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0C1B2A]">
              {sectorName
                ? `${sectorName}${city ? ` à ${city}` : ""}`
                : q
                  ? `Résultats pour "${q}"${city ? ` à ${city}` : ""}`
                  : "Tous les professionnels"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#00B4D8]" />
                {merchantsWithRating.length} résultat
                {merchantsWithRating.length !== 1 ? "s" : ""} trouvés
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Active filter pills */}
            {activeFilters.length > 0 && (
              <div className="flex items-center gap-1.5 mr-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                {activeFilters.map((filter) => {
                  const newParams = new URLSearchParams(params as Record<string, string>);
                  newParams.delete(filter.param);
                  return (
                    <Link
                      key={filter.param}
                      href={`/search?${newParams.toString()}`}
                      className="inline-flex items-center gap-1 bg-[#0066FF]/10 text-[#0066FF] text-xs font-medium px-2.5 py-1 rounded-full hover:bg-[#0066FF]/20 transition-colors"
                    >
                      {filter.label}
                      <X className="h-3 w-3" />
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Map link */}
            <Link
              href={mapLink}
              className="btn-press inline-flex items-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
            >
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Voir sur la carte</span>
              <span className="sm:hidden">Carte</span>
            </Link>
          </div>
        </div>

        {/* Merchant Grid */}
        {merchantsWithRating.length > 0 ? (
          <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
            {merchantsWithRating.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="animate-fade-in-up flex flex-col items-center justify-center py-24 px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 flex items-center justify-center mb-6">
              <SearchX className="h-10 w-10 text-[#0066FF]/40" />
            </div>
            <h2 className="text-xl font-bold text-[#0C1B2A] mb-2">
              Aucun résultat trouvé
            </h2>
            <p className="text-gray-500 text-sm text-center max-w-sm mb-6">
              Nous n'avons trouvé aucun professionnel correspondant à vos critères.
              Essayez de modifier votre recherche.
            </p>
            <Link
              href="/search"
              className="btn-press inline-flex items-center gap-2 border border-[#0066FF]/30 text-[#0066FF] text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0066FF]/5 transition-all"
            >
              Effacer les filtres
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
