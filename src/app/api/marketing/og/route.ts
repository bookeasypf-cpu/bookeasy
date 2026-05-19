/**
 * Génération automatique de visuels marketing pour les marchands.
 *
 * Usage : /api/marketing/og?merchantId=xxx&template=hero|ui|testimonial&format=square|story
 *
 * Logique photo de fond :
 *  - Plan PRO + coverImage présente = utilise la photo du marchand (authentique)
 *  - Sinon = fallback Unsplash générique du secteur
 */
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getPalette,
  OG_DIMENSIONS,
  type OgTemplate,
  type OgFormat,
} from "@/lib/marketing/sectors";

export const runtime = "nodejs";

const SECTOR_FALLBACK_PHOTOS: Record<string, string> = {
  spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1080&q=80&auto=format&fit=crop",
  "institut-beaute": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1080&q=80&auto=format&fit=crop",
  massage: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1080&q=80&auto=format&fit=crop",
  "manucure-onglerie": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1080&q=80&auto=format&fit=crop",
  maquillage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1080&q=80&auto=format&fit=crop",
  tatoueur: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=1080&q=80&auto=format&fit=crop",
  barber: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1080&q=80&auto=format&fit=crop",
  coiffeur: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1080&q=80&auto=format&fit=crop",
  "coach-sportif": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1080&q=80&auto=format&fit=crop",
  "medecin-generaliste": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1080&q=80&auto=format&fit=crop",
  dentiste: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1080&q=80&auto=format&fit=crop",
  osteopathe: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=1080&q=80&auto=format&fit=crop",
  kinesitherapeute: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1080&q=80&auto=format&fit=crop",
  infirmier: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1080&q=80&auto=format&fit=crop",
};

const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80&auto=format&fit=crop";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get("merchantId");
  const template = (searchParams.get("template") ?? "hero") as OgTemplate;
  const format = (searchParams.get("format") ?? "square") as OgFormat;

  if (!merchantId) {
    return new Response("merchantId required", { status: 400 });
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      businessName: true,
      city: true,
      coverImage: true,
      plan: true,
      sector: { select: { slug: true, name: true } },
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { name: true, duration: true, price: true, currency: true },
      },
      reviews: { select: { rating: true } },
      _count: { select: { reviews: true } },
      photos: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  if (!merchant) {
    return new Response("merchant not found", { status: 404 });
  }

  const sectorSlug = merchant.sector?.slug ?? null;
  const palette = getPalette(sectorSlug);
  const dimensions = OG_DIMENSIONS[format] ?? OG_DIMENSIONS.square;

  const isPro = merchant.plan === "PRO";
  const hasMerchantPhoto = Boolean(merchant.coverImage || merchant.photos[0]?.url);
  const bgPhoto =
    isPro && hasMerchantPhoto
      ? merchant.coverImage ?? merchant.photos[0]?.url ?? ""
      : (sectorSlug && SECTOR_FALLBACK_PHOTOS[sectorSlug]) ?? DEFAULT_PHOTO;

  const reviewCount = merchant._count.reviews;
  const avgRating =
    merchant.reviews.length > 0
      ? (merchant.reviews.reduce((s, r) => s + r.rating, 0) / merchant.reviews.length).toFixed(1)
      : "5.0";
  const service = merchant.services[0];

  const renderTemplate = () => {
    if (template === "ui") return renderUI({ merchant, palette, bgPhoto, service, avgRating, reviewCount });
    if (template === "testimonial") return renderTestimonial({ merchant, palette, bgPhoto });
    return renderHero({ merchant, palette, bgPhoto });
  };

  return new ImageResponse(renderTemplate(), {
    ...dimensions,
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

// ───────── TEMPLATE 1 : HERO MAGAZINE ─────────
function renderHero({ merchant, palette, bgPhoto }: any) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
      <img src={bgPhoto} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,30,45,0) 0%, rgba(15,30,45,0.92) 100%)", display: "flex" }} />
      <div style={{ position: "absolute", top: 60, left: 60, color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: 4, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 50, height: 2, background: palette.accent }} />
        {(merchant.sector?.name ?? "POLYNÉSIE").toUpperCase()}
      </div>
      <div style={{ position: "absolute", bottom: 180, left: 60, right: 60, color: "#fff", fontSize: 100, fontWeight: 900, fontStyle: "italic", lineHeight: 1, letterSpacing: -3, display: "flex", flexDirection: "column" }}>
        {palette.tagline}
      </div>
      <div style={{ position: "absolute", bottom: 60, left: 60, right: 60, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4 }}>BOOKEASY.ME</div>
        <div style={{ fontSize: 22, color: palette.accent, letterSpacing: 2 }}>{(merchant.sector?.name ?? "").toUpperCase()}</div>
      </div>
    </div>
  );
}

// ───────── TEMPLATE 2 : UI SHOWCASE ─────────
function renderUI({ merchant, palette, bgPhoto, service, avgRating, reviewCount }: any) {
  const priceLabel = service ? `${service.duration} min · ${Math.round(service.price)} ${service.currency === "XPF" ? "XPF" : service.currency}` : "Disponible maintenant";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
      <img src={bgPhoto} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${palette.primary}40 0%, rgba(15,30,45,0.65) 100%)`, display: "flex" }} />

      <div style={{ position: "absolute", top: 50, left: 50, background: "#fff", color: palette.deep, padding: "16px 24px", borderRadius: 999, fontSize: 22, fontWeight: 800, letterSpacing: 2, display: "flex" }}>
        ⚡ DISPO À {(merchant.city ?? "PAPEETE").toUpperCase()}
      </div>
      <div style={{ position: "absolute", top: 50, right: 50, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", padding: "20px 28px", borderRadius: 28, color: "#fff", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{avgRating}</div>
        <div style={{ fontSize: 18, opacity: 0.9, marginTop: 6 }}>{reviewCount} AVIS</div>
      </div>

      <div style={{ position: "absolute", bottom: 160, left: 50, right: 50, background: "#fff", borderRadius: 32, padding: 36, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 22 }}>
          <div style={{ width: 88, height: 88, borderRadius: 24, background: `linear-gradient(135deg, ${palette.accent}, ${palette.primary})`, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>{palette.emoji}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: palette.deep, lineHeight: 1.05 }}>{merchant.businessName}</div>
            <div style={{ fontSize: 22, color: "#6b7280", marginTop: 6 }}>{service?.name ?? "Réservez maintenant"} · {priceLabel}</div>
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#F59E0B", fontWeight: 700, marginBottom: 22, display: "flex" }}>★★★★★ &nbsp;<span style={{ color: "#6b7280", fontWeight: 500 }}>{avgRating} · {reviewCount} avis</span></div>
        <div style={{ background: palette.deep, color: "#fff", padding: 24, borderRadius: 18, fontSize: 26, fontWeight: 800, textAlign: "center", display: "flex", justifyContent: "center" }}>Réserver maintenant →</div>
      </div>

      <div style={{ position: "absolute", bottom: 50, left: 50, color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: 3, display: "flex" }}>BOOKEASY.ME</div>
    </div>
  );
}

// ───────── TEMPLATE 3 : TESTIMONIAL ─────────
function renderTestimonial({ merchant, palette, bgPhoto }: any) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
      <img src={bgPhoto} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,30,45,0.4) 0%, rgba(15,30,45,0.95) 100%)", display: "flex" }} />

      <div style={{ position: "absolute", top: 50, left: 60, fontSize: 220, fontStyle: "italic", color: palette.accent, lineHeight: 0.8, fontWeight: 900, display: "flex" }}>“</div>

      <div style={{ position: "absolute", top: 280, left: 60, right: 60, color: "#fff", fontSize: 56, fontStyle: "italic", fontWeight: 500, lineHeight: 1.2, display: "flex" }}>
        Un service de qualité chez {merchant.businessName}. Réservé en 2 clics sur BookEasy.
      </div>

      <div style={{ position: "absolute", bottom: 180, left: 60, color: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ color: "#FFD700", fontSize: 30, marginBottom: 12 }}>★★★★★</div>
        <div style={{ fontSize: 28, fontWeight: 700 }}>Client BookEasy</div>
        <div style={{ fontSize: 22, opacity: 0.85, marginTop: 6 }}>{merchant.city ?? "Polynésie"} · client vérifié</div>
      </div>

      <div style={{ position: "absolute", bottom: 50, left: 50, right: 50, background: "#fff", color: palette.deep, padding: 24, borderRadius: 999, fontSize: 26, fontWeight: 800, textAlign: "center", letterSpacing: 3, display: "flex", justifyContent: "center" }}>
        RÉSERVE → BOOKEASY.ME
      </div>
    </div>
  );
}
