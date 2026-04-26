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
import ClientOnboardingWrapper from "@/components/onboarding/ClientOnboardingWrapper";
import {
  Calendar,
  ArrowRight,
  Users,
  Grid3X3,
  Globe,
  Map,
  Sparkles,
  Search,
  CalendarCheck,
  CheckCircle,
  Star,
  Quote,
  HelpCircle,
} from "lucide-react";
import { FAQ } from "@/components/ui/FAQ";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sectors, merchants, activeMerchantCount, activeSectorCount, recentReviews] = await Promise.all([
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
    prisma.merchant.count({ where: { isActive: true } }),
    prisma.sector.count({ where: { merchants: { some: { isActive: true } } } }),
    prisma.review.findMany({
      where: { rating: { gte: 4 } },
      include: {
        client: { select: { name: true, image: true } },
        merchant: { select: { businessName: true } },
        booking: { select: { service: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-gray-950">
      <Header />
      <ClientOnboardingWrapper />

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0C1B2A] via-[#0C1B2A]/95 to-[#0066FF]/20">
        <AnimatedBackground />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
          <div className="text-center max-w-4xl mx-auto">
            {/* Small tag with shimmer */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-fade-in border border-white/5">
              <Sparkles className="h-4 w-4 text-[#00B4D8]" />
              Polynésie française
            </div>

            {/* Word-by-word reveal title */}
            <HeroTitle
              words={[
                "Réservez",
                "vos",
                "rendez-vous",
                "en",
                { text: "Polynésie française", highlight: true },
              ]}
              rotatingWords={[
                "Polynésie française",
                "toute simplicité",
                "quelques clics",
                "toute confiance",
              ]}
              rotateInterval={3000}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight tracking-tight"
            />

            <p
              className="text-base sm:text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "0.9s" }}
            >
              Coiffeurs, barbers, esthéticiennes, tatoueurs, spas et bien
              plus. Trouvez et réservez le professionnel qu&apos;il vous faut.
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
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] dark:from-gray-950 to-transparent" />
      </section>

      {/* ===== EXPLORE MAP CTA ===== */}
      <ScrollReveal direction="scale" className="max-w-7xl mx-auto px-4 sm:px-6 w-full -mt-8 relative z-10">
        <Link
          href="/map"
          className="group block rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-400"
          style={{ transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-5 sm:p-6">
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 flex items-center justify-center group-hover:from-[#0066FF]/20 group-hover:to-[#00B4D8]/20 transition-all duration-300 group-hover:scale-105">
              <Map className="h-8 w-8 sm:h-10 sm:w-10 text-[#0066FF] group-hover:scale-110 transition-transform duration-300" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#0066FF] transition-colors">
                Explorer la carte interactive
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Découvrez les professionnels autour de vous sur notre carte interactive
              </p>
            </div>

            <div className="flex-shrink-0">
              <span className="btn-slide inline-flex items-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 text-sm">
                <span className="btn-text">
                  Explorer la carte
                  <ArrowRight className="h-4 w-4" />
                </span>
                <span className="btn-text-clone">
                  Explorer la carte
                  <ArrowRight className="h-4 w-4" />
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
      <section className="border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
            <ScrollReveal delay={0}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 mb-4 glow-pulse">
                  <Users className="h-6 w-6 text-[#0066FF]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  <CountUp end={activeMerchantCount} suffix="+" />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Professionnels
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 mb-4 glow-pulse">
                  <Grid3X3 className="h-6 w-6 text-[#0066FF]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  <CountUp end={activeSectorCount} />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Secteurs d&apos;activité
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 mb-4 glow-pulse">
                  <Globe className="h-6 w-6 text-[#0066FF]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  <CountUp end={100} suffix="%" />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Polynésie
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 w-full">
        <SectionTitle
          title="Comment ça marche"
          subtitle="Réservez en 3 étapes simples"
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Timeline connector (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-[2px]">
            <div className="w-full h-full bg-gradient-to-r from-[#0066FF]/20 via-[#00B4D8]/30 to-[#0066FF]/20 rounded-full" />
          </div>

          {[
            {
              icon: Search,
              step: "1",
              title: "Trouvez",
              description: "Recherchez par secteur, nom ou ville parmi les professionnels de Polynésie",
              color: "from-[#0066FF] to-[#3B82F6]",
            },
            {
              icon: CalendarCheck,
              step: "2",
              title: "Réservez",
              description: "Choisissez votre créneau, confirmez en quelques clics, 24h/24 et 7j/7",
              color: "from-[#00B4D8] to-[#06B6D4]",
            },
            {
              icon: CheckCircle,
              step: "3",
              title: "Profitez",
              description: "Recevez la confirmation et gagnez des points fidélité à chaque visite",
              color: "from-[#10B981] to-[#34D399]",
            },
          ].map((item, index) => (
            <ScrollReveal key={item.step} delay={index * 150}>
              <div className="relative text-center group">
                {/* Step circle */}
                <div className="relative mx-auto mb-6 w-28 h-28">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                  <div className={`absolute inset-3 rounded-full bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center">
                    <span className={`text-xs font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      {item.step}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== RECENT REVIEWS (Social Proof) ===== */}
      {recentReviews.length > 0 && (
        <section className="border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <SectionTitle
              title="Ce qu'en disent nos clients"
              subtitle="Avis vérifiés de clients satisfaits"
            />

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentReviews.map((review, index) => (
                <ScrollReveal key={review.id} delay={index * 100}>
                  <div className="relative bg-[#F8FAFC] dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 card-hover group">
                    {/* Quote icon */}
                    <Quote className="absolute top-4 right-4 h-6 w-6 text-[#0066FF]/10 group-hover:text-[#0066FF]/20 transition-colors" />

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-3">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                        &quot;{review.comment}&quot;
                      </p>
                    )}

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      {review.client.image ? (
                        <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={review.client.image} alt={review.client.name || ""} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {review.client.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {review.client.name || "Client"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {review.merchant.businessName}
                          {review.booking?.service?.name && ` · ${review.booking.service.name}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FAQ SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 w-full">
        <ScrollReveal>
          <div className="flex items-center gap-3 justify-center mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-[#0066FF]" />
            </div>
          </div>
          <SectionTitle
            title="Questions fréquentes"
            subtitle="Tout ce que vous devez savoir sur BookEasy"
          />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mt-10 max-w-3xl mx-auto">
            <FAQ
              items={[
                {
                  question: "BookEasy est-il gratuit pour les clients ?",
                  answer: "Oui, BookEasy est 100% gratuit pour les clients. Vous pouvez rechercher des professionnels, consulter leurs disponibilités et réserver en ligne sans aucun frais.",
                },
                {
                  question: "Comment annuler ou modifier un rendez-vous ?",
                  answer: "Rendez-vous dans « Mes réservations » depuis votre compte. Vous pouvez annuler un rendez-vous à tout moment. Le professionnel sera notifié automatiquement par email.",
                },
                {
                  question: "Qu'est-ce que les points XP ?",
                  answer: "Les points XP sont notre programme de fidélité. Vous gagnez des XP à chaque réservation honorée, en parrainant des amis ou en offrant des cartes cadeaux. Vous pouvez les échanger contre des réductions chez les professionnels participants.",
                },
                {
                  question: "Les cartes cadeaux sont-elles valables partout ?",
                  answer: "Vous pouvez offrir une carte cadeau universelle (valable chez tous les partenaires BookEasy) ou ciblée sur un professionnel précis. Les cartes sont valables 1 an à compter de la date d'achat.",
                },
                {
                  question: "Je suis professionnel, comment m'inscrire ?",
                  answer: "Créez un compte en choisissant « Professionnel » lors de l'inscription. Vous pourrez configurer vos services, horaires et disponibilités immédiatement. Le plan Gratuit vous permet de démarrer sans engagement.",
                },
              ]}
            />
          </div>
        </ScrollReveal>
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
              Vous êtes professionnel ?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-white/50 mb-8 max-w-md mx-auto text-base leading-relaxed">
              Rejoignez BookEasy et développez votre clientèle.
              Laissez vos clients réserver en ligne 24h/24.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <Link
              href="/register?role=MERCHANT"
              className="btn-slide btn-press inline-flex items-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00B4D8] hover:from-[#0052CC] hover:to-[#0891B2] text-white px-7 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 text-base"
            >
              <span className="btn-text">
                Créer mon compte pro
                <ArrowRight className="h-4 w-4" />
              </span>
              <span className="btn-text-clone">
                Créer mon compte pro
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
