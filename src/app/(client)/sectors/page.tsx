import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search/SearchBar";
import { SectorGrid } from "@/components/search/SectorGrid";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CountUp } from "@/components/ui/CountUp";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FAQ } from "@/components/ui/FAQ";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

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

  const totalPros = sectors.reduce((sum, s) => sum + s._count.merchants, 0);

  // Get distinct cities for SEO links
  const cityCounts = await prisma.merchant.groupBy({
    by: ["city"],
    where: { isActive: true, city: { not: null } },
    _count: true,
    orderBy: { _count: { city: "desc" } },
  });

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0C1B2A] to-[#132D46] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 animate-fade-in-up">
            Secteurs d&apos;activité
          </h1>
          <p className="text-white/60 max-w-xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Explorez tous les types de professionnels disponibles sur BookEasy
            en Polynésie française.
          </p>
          <div className="flex items-center gap-6 mt-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">
                <CountUp end={sectors.length} />
              </span>
              <span className="text-sm text-white/40">secteurs</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">
                <CountUp end={totalPros} suffix="+" />
              </span>
              <span className="text-sm text-white/40">professionnels</span>
            </div>
          </div>
          <div className="mt-8 max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Sectors grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <SectorGrid sectors={sectors} />

        {/* Sector details with merchant counts */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectors.map((sector, index) => (
            <ScrollReveal key={sector.id} delay={index * 60}>
              <Link
                href={`/search?sector=${sector.slug}`}
                className="group flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 card-hover"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#0066FF] transition-colors">
                    {sector.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {sector._count.merchants} professionnel
                    {sector._count.merchants > 1 ? "s" : ""}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 dark:text-gray-500 group-hover:text-[#0066FF] group-hover:translate-x-1 transition-all" />
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* SEO Local Links */}
        {cityCounts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Réservation par ville
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {sectors.slice(0, 8).flatMap((sector) =>
                cityCounts.slice(0, 6).map((cc) => {
                  const city = cc.city as string;
                  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
                  return (
                    <Link
                      key={`${sector.slug}-${citySlug}`}
                      href={`/reservation/${sector.slug}-${citySlug}`}
                      className="px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-[#0066FF] hover:bg-[#0066FF]/5 transition-colors truncate"
                    >
                      {sector.name} à {city}
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Questions fréquentes
          </h2>
          <FAQ
            items={[
              {
                question: "Comment trouver un professionnel dans mon secteur ?",
                answer: "Cliquez sur le secteur qui vous intéresse ci-dessus, ou utilisez la barre de recherche pour filtrer par nom, ville ou type de service. Vous pouvez aussi explorer la carte interactive pour trouver les professionnels proches de vous.",
              },
              {
                question: "Les professionnels sont-ils vérifiés ?",
                answer: "Tous les professionnels sur BookEasy ont créé un compte vérifié. Les professionnels avec le badge « Pro vérifié » ont souscrit à un abonnement et bénéficient de fonctionnalités avancées comme les avis clients.",
              },
              {
                question: "Puis-je réserver en dehors des heures d'ouverture ?",
                answer: "Oui ! BookEasy vous permet de réserver 24h/24, 7j/7. Le professionnel recevra votre demande et vous recevrez une confirmation par email.",
              },
            ]}
          />
        </div>
      </div>
    </>
  );
}
