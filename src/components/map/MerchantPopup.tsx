"use client";

import Link from "next/link";
import { Star, MapPin, Clock } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";

interface MerchantPopupProps {
  merchant: {
    id: string;
    businessName: string;
    description: string | null;
    address: string | null;
    city: string | null;
    coverImage: string | null;
    sector: { id: string; name: string; slug: string; icon: string };
    services: { id: string; name: string; price: number; duration: number }[];
    reviews: { rating: number }[];
  };
}

export function MerchantPopup({ merchant }: MerchantPopupProps) {
  const avgRating =
    merchant.reviews.length > 0
      ? merchant.reviews.reduce((sum, r) => sum + r.rating, 0) /
        merchant.reviews.length
      : 0;

  return (
    <div className="w-[280px] font-sans">
      {/* Header with image or gradient */}
      <div className="relative h-28 -mx-[1px] -mt-[1px] rounded-t-lg overflow-hidden">
        {merchant.coverImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={merchant.coverImage}
            alt={merchant.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center">
            <span className="text-4xl font-bold text-white/30">
              {merchant.businessName[0]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Sector badge */}
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-gray-800">
            {merchant.sector.name}
          </span>
        </div>

        {/* Rating */}
        {avgRating > 0 && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-gray-800">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {avgRating.toFixed(1)}
              <span className="text-gray-500">({merchant.reviews.length})</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1">
          {merchant.businessName}
        </h3>

        {(merchant.address || merchant.city) && (
          <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2.5">
            <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
            <span className="truncate">
              {merchant.address || merchant.city}
            </span>
          </p>
        )}

        {/* Services */}
        {merchant.services.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {merchant.services.slice(0, 2).map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5"
              >
                <span className="text-gray-700 dark:text-gray-200 font-medium truncate mr-2">
                  {service.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-0.5 text-gray-400">
                    <Clock className="h-3 w-3" />
                    {formatDuration(service.duration)}
                  </span>
                  <span className="font-semibold text-[#0066FF]">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/merchants/${merchant.id}`}
            className="flex-1 text-center text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Voir le profil
          </Link>
          <Link
            href={`/booking/${merchant.id}`}
            className="flex-1 text-center text-xs font-semibold text-white bg-gradient-to-r from-[#0066FF] to-[#00B4D8] rounded-lg py-2 hover:shadow-md transition-all"
          >
            Réserver
          </Link>
        </div>
      </div>
    </div>
  );
}
