import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search/SearchBar";
import { SectorGrid } from "@/components/search/SectorGrid";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secteurs d'activité - BookEasy",
  description:
    "Découvrez tous les secteurs d'activité disponibles sur BookEasy : coiffeurs, barbers, esthéticiennes, spas, coachs sportifs et bien plus en Polynésie française.",
};

export default async function SectorsPage() {
  const sectors = await prisma.sector.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { merchants: { where: { isActive: true } } } },
    },
  });

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0C1B2A] to-[#132D46] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Secteurs d&apos;activit&eacute;
          </h1>
          <p className="text-white/60 max-w-xl">
            Explorez tous les types de professionnels disponibles sur BookEasy
            en Polyn&eacute;sie fran&ccedil;aise.
          </p>
          <div className="mt-8 max-w-2xl">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Sectors grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <SectorGrid sectors={sectors} />

        {/* Sector details with merchant counts */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectors.map((sector) => (
            <Link
              key={sector.id}
              href={`/search?sector=${sector.slug}`}
              className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 hover:border-[#0066FF]/20 hover:shadow-lg hover:shadow-[#0066FF]/5 transition-all duration-300"
            >
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-[#0066FF] transition-colors">
                  {sector.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {sector._count.merchants} professionnel
                  {sector._count.merchants > 1 ? "s" : ""}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#0066FF] group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
