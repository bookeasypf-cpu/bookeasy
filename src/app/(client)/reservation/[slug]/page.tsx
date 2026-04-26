import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MerchantCard } from "@/components/search/MerchantCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FAQ } from "@/components/ui/FAQ";
import { SearchBar } from "@/components/search/SearchBar";
import { MapPin, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Parse slug like "coiffeur-papeete" → { sectorSlug: "coiffeur", city: "papeete" } */
function parseSlug(slug: string): { sectorSlug: string; city: string | null } {
  // Try to match sector-city pattern by checking against known cities
  const CITIES = [
    "papeete", "faaa", "punaauia", "pirae", "arue", "mahina", "paea",
    "papara", "taravao", "teva-i-uta", "moorea", "bora-bora", "raiatea",
    "tahaa", "huahine", "rangiroa", "tikehau", "fakarava", "nuku-hiva",
    "hiva-oa", "ua-pou", "ua-huka", "fatu-hiva", "taputapuatea",
    "mataiea", "afaahiti", "toahotu", "vairao",
  ];

  for (const city of CITIES) {
    if (slug.endsWith(`-${city}`)) {
      return {
        sectorSlug: slug.slice(0, -(city.length + 1)),
        city,
      };
    }
  }

  // No city match — entire slug is the sector
  return { sectorSlug: slug, city: null };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatCity(city: string): string {
  return city
    .split("-")
    .map(capitalize)
    .join("-");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { sectorSlug, city } = parseSlug(slug);

  const sector = await prisma.sector.findUnique({
    where: { slug: sectorSlug },
  });

  if (!sector) return { title: "Réservation - BookEasy" };

  const cityLabel = city ? formatCity(city) : "Polynésie française";
  const title = `${sector.name} à ${cityLabel} - Réservation en ligne | BookEasy`;
  const description = `Trouvez et réservez votre ${sector.name.toLowerCase()} à ${cityLabel}. Comparez les avis, consultez les disponibilités et réservez en ligne 24h/24 sur BookEasy.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function ReservationSeoPage({ params }: PageProps) {
  const { slug } = await params;
  const { sectorSlug, city } = parseSlug(slug);

  const sector = await prisma.sector.findUnique({
    where: { slug: sectorSlug },
  });

  if (!sector) notFound();

  const cityFilter = city
    ? { city: { equals: formatCity(city), mode: "insensitive" as const } }
    : {};

  const merchants = await prisma.merchant.findMany({
    where: {
      isActive: true,
      sectorId: sector.id,
      ...cityFilter,
    },
    include: {
      sector: true,
      reviews: { select: { rating: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const merchantsWithRating = merchants.map((m) => ({
    ...m,
    avgRating:
      m.reviews.length > 0
        ? m.reviews.reduce((sum, r) => sum + r.rating, 0) / m.reviews.length
        : 0,
  }));

  const cityLabel = city ? formatCity(city) : null;
  const locationLabel = cityLabel || "Polynésie française";
  const sectorLower = sector.name.toLowerCase();

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0C1B2A] to-[#132D46] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-2 text-white/40 text-sm mb-4 animate-fade-in-up">
            <Link href="/sectors" className="hover:text-white/60 transition-colors">
              Secteurs
            </Link>
            <span>/</span>
            <Link href={`/search?sector=${sector.slug}`} className="hover:text-white/60 transition-colors">
              {sector.name}
            </Link>
            {cityLabel && (
              <>
                <span>/</span>
                <span className="text-white/60">{cityLabel}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in-up">
            {sector.name} à {locationLabel}
          </h1>
          <p
            className="text-white/60 max-w-2xl text-lg animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Trouvez et réservez votre {sectorLower} à {locationLabel}.
            Comparez les avis, consultez les disponibilités et réservez en ligne.
          </p>

          <div className="flex items-center gap-6 mt-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00B4D8]" />
              <span className="font-bold text-white">{merchants.length}</span>
              <span className="text-white/40 text-sm">
                professionnel{merchants.length > 1 ? "s" : ""}
              </span>
            </div>
            {cityLabel && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#00B4D8]" />
                <span className="text-white/60 text-sm">{cityLabel}</span>
              </div>
            )}
          </div>

          <div className="mt-8 max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <SearchBar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Results */}
        {merchantsWithRating.length > 0 ? (
          <>
            <SectionTitle
              title={`Les meilleurs ${sectorLower}s à ${locationLabel}`}
              subtitle={`${merchantsWithRating.length} professionnel${merchantsWithRating.length > 1 ? "s" : ""} disponible${merchantsWithRating.length > 1 ? "s" : ""}`}
              align="left"
            />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {merchantsWithRating.map((merchant, index) => (
                <ScrollReveal key={merchant.id} delay={index * 80}>
                  <MerchantCard merchant={merchant} />
                </ScrollReveal>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Aucun {sectorLower} trouvé {cityLabel ? `à ${cityLabel}` : ""}
            </h2>
            <p className="text-gray-500 mb-6">
              Essayez une recherche plus large ou explorez d&apos;autres secteurs.
            </p>
            <Link
              href={`/search?sector=${sector.slug}`}
              className="inline-flex items-center gap-2 text-[#0066FF] font-semibold hover:underline"
            >
              Voir tous les {sectorLower}s
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* SEO FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Questions fréquentes — {sector.name} à {locationLabel}
          </h2>
          <FAQ
            items={[
              {
                question: `Comment réserver un ${sectorLower} à ${locationLabel} ?`,
                answer: `Sur BookEasy, recherchez « ${sector.name} » dans la barre de recherche${cityLabel ? ` ou filtrez par la ville de ${cityLabel}` : ""}. Consultez les profils, les avis clients et les disponibilités, puis réservez en quelques clics. C'est gratuit et disponible 24h/24.`,
              },
              {
                question: `Combien coûte un ${sectorLower} à ${locationLabel} ?`,
                answer: `Les tarifs varient selon le professionnel et le service choisi. Sur BookEasy, chaque professionnel affiche ses prix en toute transparence. Comparez les offres et choisissez celle qui correspond à votre budget.`,
              },
              {
                question: `Peut-on annuler un rendez-vous chez un ${sectorLower} ?`,
                answer: `Oui, vous pouvez annuler votre rendez-vous à tout moment depuis votre espace « Mes réservations ». Le professionnel sera notifié automatiquement. Nous vous recommandons d'annuler le plus tôt possible par courtoisie.`,
              },
              {
                question: `Les ${sectorLower}s sur BookEasy sont-ils vérifiés ?`,
                answer: `Tous les professionnels sur BookEasy ont créé un compte vérifié avec leurs informations d'activité. Les professionnels « Pro vérifié » bénéficient d'un abonnement et sont mis en avant grâce à leurs avis clients.`,
              },
            ]}
          />
        </div>

        {/* Internal links */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Voir aussi
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/search?sector=${sector.slug}`}
              className="px-4 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#0066FF]/10 hover:text-[#0066FF] transition-colors"
            >
              Tous les {sectorLower}s
            </Link>
            <Link
              href="/sectors"
              className="px-4 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#0066FF]/10 hover:text-[#0066FF] transition-colors"
            >
              Tous les secteurs
            </Link>
            <Link
              href="/map"
              className="px-4 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#0066FF]/10 hover:text-[#0066FF] transition-colors"
            >
              Carte interactive
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
