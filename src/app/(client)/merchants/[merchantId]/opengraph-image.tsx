import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "Professionnel BookEasy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ merchantId: string }>;
}) {
  const { merchantId } = await params;

  let name = "Professionnel";
  let sector = "";
  let city = "";
  let rating = "";
  let reviewCount = 0;

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        businessName: true,
        city: true,
        sector: { select: { name: true } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
    });

    if (merchant) {
      name = merchant.businessName;
      sector = merchant.sector?.name || "";
      city = merchant.city || "";
      reviewCount = merchant._count.reviews;
      if (merchant.reviews.length > 0) {
        const avg = merchant.reviews.reduce((s, r) => s + r.rating, 0) / merchant.reviews.length;
        rating = avg.toFixed(1);
      }
    }
  } catch {
    // Fallback to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0C1B2A 0%, #132D46 60%, #0066FF 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Sector badge */}
        {sector && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                background: "rgba(0, 102, 255, 0.3)",
                color: "#67E8F9",
                padding: "8px 20px",
                borderRadius: "99px",
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              {sector}
            </span>
          </div>
        )}

        {/* Business name */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.1,
            marginBottom: "16px",
            maxWidth: "900px",
          }}
        >
          {name}
        </div>

        {/* City + rating */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginTop: "12px",
          }}
        >
          {city && (
            <span
              style={{
                fontSize: "24px",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {city}, Polynésie française
            </span>
          )}
          {rating && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "24px",
                color: "#FBBF24",
                fontWeight: 700,
              }}
            >
              ★ {rating} ({reviewCount} avis)
            </span>
          )}
        </div>

        {/* BookEasy branding */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "28px", fontWeight: 800, color: "white" }}>
            Book
          </span>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#00B4D8",
            }}
          >
            Easy
          </span>
        </div>

        {/* CTA */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(90deg, #0066FF, #00B4D8)",
            padding: "12px 28px",
            borderRadius: "12px",
            fontSize: "20px",
            fontWeight: 700,
            color: "white",
          }}
        >
          Réserver en ligne →
        </div>

        {/* Bottom gradient bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "4px",
            background: "linear-gradient(90deg, #0066FF, #00B4D8, #0066FF)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
