"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProBadge } from "@/components/ui/ProBadge";
import { SectorIcon } from "@/components/ui/SectorIcon";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

interface MerchantCardProps {
  merchant: {
    id: string;
    businessName: string;
    city: string | null;
    coverImage: string | null;
    plan?: string;
    sector: { name: string };
    _count?: { reviews: number };
    avgRating?: number;
  };
}

/**
 * PacifikAI-inspired merchant card with:
 * - 3D tilt on hover
 * - Mouse-tracking gradient glow
 * - Smooth image parallax on hover
 * - Glassmorphism overlay
 */
export function MerchantCard({ merchant }: MerchantCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 4;
      const rotateX = ((centerY - y) / centerY) * 4;

      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
      el.style.setProperty("--mouse-x", `${x}px`);
      el.style.setProperty("--mouse-y", `${y}px`);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
  }, []);

  return (
    <Link href={`/merchants/${merchant.id}`} className="group block">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="card-glow rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-400"
        style={{
          willChange: "transform",
          transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 25px 60px -15px rgba(0, 102, 255, 0.18), 0 0 0 1px rgba(0, 102, 255, 0.08)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = "";
        }}
      >
        {/* Image area with parallax effect */}
        <div className="relative h-44 overflow-hidden">
          {merchant.coverImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={merchant.coverImage}
              alt={merchant.businessName}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center relative overflow-hidden">
              {/* Animated gradient mesh */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)",
                }}
              />
              {/* Sector-specific icon */}
              <SectorIcon
                sector={merchant.sector.name}
                size={72}
                className="text-white/25 relative z-10 group-hover:scale-110 group-hover:text-white/35 transition-all duration-500"
              />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Sector badge + Pro badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <Badge variant="gradient">{merchant.sector.name}</Badge>
            {merchant.plan === "PRO" && <ProBadge size="sm" />}
          </div>

          {/* Favorite button */}
          <div className="absolute top-3 right-3">
            <FavoriteButton merchantId={merchant.id} size="sm" />
          </div>

          {/* Hover "Réserver" button with slide-up effect */}
          <div className="absolute bottom-3 right-3 opacity-100 sm:opacity-0 sm:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out">
            <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-[#0066FF] text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-black/10 group-hover:bg-white transition-colors">
              Réserver
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
            </span>
          </div>
        </div>

        {/* Info area */}
        <div className="p-4 relative z-10">
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1.5 group-hover:text-[#0066FF] transition-colors duration-300">
            {merchant.businessName}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            {merchant.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {merchant.city}
              </span>
            )}
            {merchant.avgRating !== undefined && merchant.avgRating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {merchant.avgRating.toFixed(1)}
                </span>
                {merchant._count?.reviews !== undefined && (
                  <span className="text-gray-400">
                    ({merchant._count.reviews})
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
