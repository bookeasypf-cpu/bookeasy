"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#0066FF]/20 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-medium">
          Chargement de la carte...
        </p>
      </div>
    </div>
  ),
});

type MerchantWithDetails = {
  id: string;
  businessName: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  coverImage: string | null;
  sector: { id: string; name: string; slug: string; icon: string };
  services: { id: string; name: string; price: number; duration: number }[];
  reviews: { rating: number }[];
};

type SectorInfo = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

interface MapViewLoaderProps {
  merchants: MerchantWithDetails[];
  sectors: SectorInfo[];
  initialSector?: string | null;
}

export default function MapViewLoader({
  merchants,
  sectors,
  initialSector,
}: MapViewLoaderProps) {
  return <MapView merchants={merchants} sectors={sectors} initialSector={initialSector} />;
}
