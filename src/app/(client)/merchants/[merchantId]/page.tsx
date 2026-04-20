import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MapPin, Phone, Star, Clock, ChevronRight, MessageSquare, Info, Briefcase, Calendar, Camera } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProBadge } from "@/components/ui/ProBadge";
import { BackButton } from "@/components/ui/BackButton";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { StarRating } from "@/components/ui/StarRating";
import { formatPrice, formatDuration } from "@/lib/utils";
import Link from "next/link";

interface MerchantPageProps {
  params: Promise<{ merchantId: string }>;
}

// ── SEO: Dynamic metadata ────────────────────────
export async function generateMetadata({ params }: MerchantPageProps): Promise<Metadata> {
  const { merchantId } = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId, isActive: true },
    include: {
      sector: { select: { name: true } },
      reviews: { select: { rating: true } },
    },
  });

  if (!merchant) return { title: "Professionnel introuvable - BookEasy" };

  const avgRating = merchant.reviews.length > 0
    ? (merchant.reviews.reduce((s, r) => s + r.rating, 0) / merchant.reviews.length).toFixed(1)
    : null;

  const title = `${merchant.businessName} - ${merchant.sector?.name || "Professionnel"} | BookEasy`;
  const description = merchant.description
    ? merchant.description.substring(0, 160)
    : `Réservez en ligne chez ${merchant.businessName}${merchant.city ? ` à ${merchant.city}` : ""}. ${merchant.sector?.name || ""}${avgRating ? ` · ${avgRating}★` : ""}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "BookEasy",
      locale: "fr_FR",
      url: `https://bookeasy.me/merchants/${merchantId}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function MerchantPage({ params }: MerchantPageProps) {
  const { merchantId } = await params;

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId, isActive: true },
    include: {
      sector: true,
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      photos: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, caption: true },
      },
      reviews: {
        include: { client: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!merchant) notFound();

  const avgRating =
    merchant.reviews.length > 0
      ? merchant.reviews.reduce((sum, r) => sum + r.rating, 0) /
        merchant.reviews.length
      : 0;

  // Rating distribution for summary
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: merchant.reviews.filter((r) => r.rating === stars).length,
    percentage:
      merchant.reviews.length > 0
        ? (merchant.reviews.filter((r) => r.rating === stars).length /
            merchant.reviews.length) *
          100
        : 0,
  }));

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: merchant.businessName,
    description: merchant.description || undefined,
    address: merchant.address || merchant.city ? {
      "@type": "PostalAddress",
      streetAddress: merchant.address || undefined,
      addressLocality: merchant.city || undefined,
      postalCode: merchant.postalCode || undefined,
      addressCountry: "PF",
    } : undefined,
    telephone: merchant.phone || undefined,
    geo: merchant.latitude && merchant.longitude ? {
      "@type": "GeoCoordinates",
      latitude: merchant.latitude,
      longitude: merchant.longitude,
    } : undefined,
    url: `https://bookeasy.me/merchants/${merchant.id}`,
    image: merchant.coverImage || undefined,
    ...(merchant.reviews.length > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: merchant._count.reviews,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
  };

  return (
    <div className="page-transition min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        {merchant.coverImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={merchant.coverImage}
            alt={merchant.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0066FF] via-[#0052CC] to-[#00B4D8]">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[120px] sm:text-[160px] font-black text-white/10 select-none">
                {merchant.businessName[0]}
              </span>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C1B2A] via-[#0C1B2A]/40 to-transparent" />

        {/* Back button + Favorite */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
          <BackButton />
        </div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <FavoriteButton merchantId={merchantId} />
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="gradient">
                {merchant.sector.name}
              </Badge>
              {merchant.plan === "PRO" && <ProBadge size="md" />}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">
              {merchant.businessName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              {merchant.plan === "PRO" && avgRating > 0 && (
                <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-white">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-white/60">
                    ({merchant._count.reviews} avis)
                  </span>
                </span>
              )}
              {merchant.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {merchant.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-10">
        <div className="glass rounded-2xl shadow-xl p-4 sm:p-5 flex flex-wrap items-center gap-4 sm:gap-6">
          {merchant.phone && (
            <a
              href={`tel:${merchant.phone}`}
              className="flex items-center gap-2.5 text-sm text-[#0C1B2A] dark:text-white hover:text-[#0066FF] transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0066FF]/10 flex items-center justify-center group-hover:bg-[#0066FF]/20 transition-colors">
                <Phone className="h-4 w-4 text-[#0066FF]" />
              </div>
              <span className="font-medium">{merchant.phone}</span>
            </a>
          )}
          {merchant.address && (
            <div className="flex items-center gap-2.5 text-sm text-[#0C1B2A] dark:text-white">
              <div className="w-9 h-9 rounded-xl bg-[#00B4D8]/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-[#00B4D8]" />
              </div>
              <span className="font-medium">
                {merchant.address}{merchant.city ? `, ${merchant.city}` : ""}
              </span>
            </div>
          )}
          {!merchant.address && merchant.city && (
            <div className="flex items-center gap-2.5 text-sm text-[#0C1B2A] dark:text-white">
              <div className="w-9 h-9 rounded-xl bg-[#00B4D8]/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-[#00B4D8]" />
              </div>
              <span className="font-medium">{merchant.city}</span>
            </div>
          )}
          {/* Book CTA (desktop) */}
          <div className="ml-auto hidden sm:block">
            <Link
              href={`/booking/${merchant.id}`}
              className="btn-press inline-flex items-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-sm"
            >
              <Calendar className="h-4 w-4" />
              Réserver
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Navigation (anchor-based, no JS) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <nav className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-800">
          <a
            href="#services"
            className="flex items-center gap-1.5 flex-1 justify-center text-sm font-semibold text-[#0066FF] bg-[#0066FF]/5 px-4 py-2.5 rounded-lg transition-colors hover:bg-[#0066FF]/10"
          >
            <Briefcase className="h-4 w-4" />
            Services
          </a>
          {merchant.photos.length > 0 && (
            <a
              href="#photos"
              className="flex items-center gap-1.5 flex-1 justify-center text-sm font-medium text-gray-500 dark:text-gray-400 px-4 py-2.5 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#0C1B2A] dark:hover:text-white"
            >
              <Camera className="h-4 w-4" />
              Photos
            </a>
          )}
          {merchant.plan === "PRO" && (
            <a
              href="#avis"
              className="flex items-center gap-1.5 flex-1 justify-center text-sm font-medium text-gray-500 dark:text-gray-400 px-4 py-2.5 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#0C1B2A] dark:hover:text-white"
            >
              <MessageSquare className="h-4 w-4" />
              Avis ({merchant._count.reviews})
            </a>
          )}
          <a
            href="#infos"
            className="flex items-center gap-1.5 flex-1 justify-center text-sm font-medium text-gray-500 dark:text-gray-400 px-4 py-2.5 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#0C1B2A] dark:hover:text-white"
          >
            <Info className="h-4 w-4" />
            Infos
          </a>
        </nav>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-28 sm:pb-12 space-y-12">

        {/* Services Section */}
        <section id="services" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0066FF] to-[#00B4D8]" />
            <h2 className="text-lg font-bold text-[#0C1B2A] dark:text-white">Services</h2>
          </div>
          <div className="stagger-children space-y-3">
            {merchant.services.map((service) => (
              <div
                key={service.id}
                className="service-card card-hover group bg-white dark:bg-gray-900 rounded-2xl border border-[#0066FF]/20 dark:border-[#0066FF]/30 shadow-sm p-5 flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#0066FF]/20 dark:hover:shadow-[#0066FF]/10"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#0C1B2A] dark:text-white group-hover:text-[#0066FF] transition-colors">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-2">
                    <Clock className="h-3 w-3" />
                    {formatDuration(service.duration)}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-lg font-bold text-[#0C1B2A] dark:text-white">
                    {formatPrice(service.price)}
                  </span>
                  <Link
                    href={`/booking/${merchant.id}?service=${service.id}`}
                    className="btn-press inline-flex items-center gap-1 bg-[#0066FF]/10 text-[#0066FF] text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-[#0066FF] hover:text-white transition-all duration-200"
                  >
                    Réserver
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Photos Gallery */}
        {merchant.photos.length > 0 && (
          <section id="photos" className="scroll-mt-24">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0066FF] to-[#00B4D8]" />
              <h2 className="text-lg font-bold text-[#0C1B2A] dark:text-white">Photos</h2>
              <span className="text-sm text-gray-400 ml-1">({merchant.photos.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {merchant.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption || merchant.businessName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white font-medium">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section — Pro only */}
        {merchant.plan === "PRO" && (
          <section id="avis" className="scroll-mt-24">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0066FF] to-[#00B4D8]" />
              <h2 className="text-lg font-bold text-[#0C1B2A] dark:text-white">
                Avis ({merchant._count.reviews})
              </h2>
            </div>

            {merchant.reviews.length > 0 ? (
              <div className="space-y-5">
                {/* Rating Summary Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Big rating number */}
                    <div className="text-center shrink-0">
                      <div className="text-5xl font-black text-[#0C1B2A] dark:text-white">
                        {avgRating.toFixed(1)}
                      </div>
                      <StarRating rating={avgRating} size={18} className="mt-1.5 justify-center" />
                      <p className="text-xs text-gray-400 mt-1.5">
                        {merchant._count.reviews} avis
                      </p>
                    </div>
                    {/* Rating bars */}
                    <div className="flex-1 w-full space-y-2">
                      {ratingDistribution.map((dist) => (
                        <div key={dist.stars} className="flex items-center gap-2.5">
                          <span className="text-xs font-medium text-gray-500 w-3 text-right">
                            {dist.stars}
                          </span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500"
                              style={{ width: `${dist.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-6 text-right">{dist.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review cards */}
                <div className="stagger-children space-y-3">
                  {merchant.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {review.client.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-[#0C1B2A] dark:text-white block">
                            {review.client.name || "Anonyme"}
                          </span>
                          <StarRating
                            rating={review.rating}
                            size={13}
                            className="mt-0.5"
                          />
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
                <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Aucun avis pour le moment</p>
              </div>
            )}
          </section>
        )}

        {/* Info Section */}
        <section id="infos" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0066FF] to-[#00B4D8]" />
            <h2 className="text-lg font-bold text-[#0C1B2A] dark:text-white">Informations</h2>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-50 dark:divide-gray-800">
            {merchant.description && (
              <div className="p-5">
                <h3 className="text-sm font-semibold text-[#0C1B2A] dark:text-white mb-2">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {merchant.description}
                </p>
              </div>
            )}
            {(merchant.address || merchant.city) && (
              <div className="p-5">
                <h3 className="text-sm font-semibold text-[#0C1B2A] dark:text-white mb-2">Adresse</h3>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-[#00B4D8] mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {merchant.address && `${merchant.address}, `}
                    {merchant.city}
                  </span>
                </div>
              </div>
            )}
            {merchant.phone && (
              <div className="p-5">
                <h3 className="text-sm font-semibold text-[#0C1B2A] dark:text-white mb-2">Téléphone</h3>
                <a
                  href={`tel:${merchant.phone}`}
                  className="flex items-center gap-2.5 text-sm text-[#0066FF] hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {merchant.phone}
                </a>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Sticky CTA (mobile only) */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-40 animate-slide-up">
        <div className="glass border-t border-gray-200/50 px-4 py-3">
          <Link
            href={`/booking/${merchant.id}`}
            className="btn-press flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/30 text-base"
          >
            <Calendar className="h-5 w-5" />
            Réserver maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}
