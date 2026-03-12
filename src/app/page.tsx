import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchBar } from "@/components/search/SearchBar";
import { SectorGrid } from "@/components/search/SectorGrid";
import { MerchantCard } from "@/components/search/MerchantCard";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HeroTitle } from "@/components/ui/HeroTitle";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CountUp } from "@/components/ui/CountUp";
import {
  Calendar,
  ArrowRight,
  Users,
  Grid3X3,
  Globe,
  Map,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const [sectors, merchants] = await Promise.all([
    prisma.sector.findMany({ orderBy: { name: "asc" } }),
    prisma.merchant.findMany({
      where: { isActive: true },
      include: {
        sector: true,
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const merchantsWithRating = merchants.map((m) => ({
    ...m,
    avgRating:
      m.reviews.length > 0
        ? m.reviews.reduce((sum, r) => sum + r.rating, 0) / m.reviews.length
        : 0,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0C1B2A] via-[#0C1B2A]/95 to-[#0066FF]/20">
        <AnimatedBackground />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
          <div className="text-center max-w-4xl mx-auto">
            {/* Small tag with shimmer */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-fade-in border border-white/5">
              <Sparkles className="h-4 w-4 text-[#00B4D8]" />
              Polyn&eacute;sie fran&ccedil;aise
            </div>

            {/* Word-by-word reveal title */}
            <HeroTitle
              words={[
                "Réservez",
                "vos",
                "rendez-vous",
                "en",
                { text: "Polynésie", highlight: true },
                { text: "française", highlight: true },
              ]}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight tracking-tight"
            />

            <p
              className="text-base sm:text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "0.9s" }}
            >
              Coiffeurs, barbers, esth&eacute;ticiennes, tatoueurs, spas et bien
              plus. Trouvez et r&eacute;servez le professionnel qu&apos;il vous faut.
            </p>

            {/* Search bar with delayed entrance */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "1.1s" }}
            >
              <SearchBar />
            </div>
          </div>
        </div>

        {/* Bottom gradient fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
      </section>

      {/* ===== EXPLORE MAP CTA ===== */}
      <ScrollReveal direction="scale" className="max-w-7xl mx-auto px-4 sm:px-6 w-full -mt-8 relative z-10">
        <Link
          href="/map"
          className="group block rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-400"
          style={{ transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-5 sm:p-6">
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 flex items-center justify-center group-hover:from-[#0066FF]/20 group-hover:to-[#00B4D8]/20 transition-all duration-300 group-hover:scale-105">
              <Map className="h-8 w-8 sm:h-10 sm:w-10 text-[#0066FF] group-hover:scale-110 transition-transform duration-300" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#0066FF] transition-colors">
                Explorer la carte interactive
              </h3>
              <p className="text-sm text-gray-500">
                D&eacute;couvrez les professionnels autour de vous sur notre carte interactive
              </p>
            </div>

            <div className="flex-shrink-0">
              <span className="btn-slide inline-flex items-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 text-sm">
                <span className="btn-text flex items-center gap-2">
                  Explorer la carte
                  <ArrowRight className="h-4 w-4" />
                </span>
                <span className="btn-text-clone">
                  Explorer la carte
                  <ArrowRight className="h-4 w-4 ml-2" />
                </span>
              </span>
            </div>
          </div>
        </Link>
      </ScrollReveal>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 w-full">
        <SectionTitle
          title="Parcourir par catégorie"
          subtitle="Sélectionnez le type de professionnel que vous recherchez"
        />
        <div className="mt-10">
          <SectorGrid sectors={sectors} />
        </div>
      </section>

      {/* ===== FEATURED MERCHANTS ===== */}
      {merchantsWithRating.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20 w-full">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-8">
              <SectionTitle
                title="Les professionnels populaires"
                subtitle="Découvrez les mieux notés de Polynésie"
                align="left"
              />
              <Link
                href="/search"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[#0066FF] font-semibold hover:text-[#0052CC] transition-colors group"
              >
                Voir tout
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {merchantsWithRating.map((merchant, index) => (
              <ScrollReveal key={merchant.id} delay={index * 120}>
                <MerchantCard merchant={merchant} />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 text-sm text-[#0066FF] font-semibold hover:text-[#0052CC] transition-colors"
              >
                Voir tous les professionnels
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* ===== STATS SECTION (with CountUp) ===== */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
            <ScrollReveal delay={0}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 mb-4 glow-pulse">
                  <Users className="h-6 w-6 text-[#0066FF]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                  <CountUp end={50} suffix="+" />
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Professionnels
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 mb-4 glow-pulse">
                  <Grid3X3 className="h-6 w-6 text-[#0066FF]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                  <CountUp end={10} />
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Secteurs d&apos;activit&eacute;
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 mb-4 glow-pulse">
                  <Globe className="h-6 w-6 text-[#0066FF]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                  <CountUp end={100} suffix="%" />
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Polyn&eacute;sie
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== CTA FOR PROS ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0C1B2A] via-[#0C1B2A] to-[#0066FF]/20 mt-auto">
        <AnimatedBackground />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <ScrollReveal direction="scale">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066FF]/20 to-[#00B4D8]/20 mb-6 glow-pulse">
              <Calendar className="h-8 w-8 text-[#00B4D8]" />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Vous &ecirc;tes professionnel ?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-white/50 mb-8 max-w-md mx-auto text-base leading-relaxed">
              Rejoignez BookEasy et d&eacute;veloppez votre client&egrave;le.
              Laissez vos clients r&eacute;server en ligne 24h/24.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <Link
              href="/register?role=MERCHANT"
              className="btn-slide btn-press inline-flex items-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00B4D8] hover:from-[#0052CC] hover:to-[#0891B2] text-white px-7 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 text-base"
            >
              <span className="btn-text flex items-center gap-2">
                Cr&eacute;er mon compte pro
                <ArrowRight className="h-4 w-4" />
              </span>
              <span className="btn-text-clone">
                Cr&eacute;er mon compte pro
                <ArrowRight className="h-4 w-4 ml-2" />
              </span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
