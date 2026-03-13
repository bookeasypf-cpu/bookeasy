"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Star, List, Map as MapIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MerchantPopup } from "./MerchantPopup";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface MapViewProps {
  merchants: MerchantWithDetails[];
  sectors: SectorInfo[];
}

// ---------------------------------------------------------------------------
// Sector color mapping
// ---------------------------------------------------------------------------

const SECTOR_COLORS: Record<string, string> = {
  coiffeur: "#0066FF",
  barber: "#6366F1",
  estheticienne: "#EC4899",
  spa: "#14B8A6",
  manucure: "#F472B6",
  massage: "#EF4444",
  tatoueur: "#8B5CF6",
  dentiste: "#10B981",
  medecin: "#06B6D4",
  kinesitherapeute: "#0891B2",
  "coach-sportif": "#F59E0B",
  photographe: "#A855F7",
  mecanicien: "#64748B",
  veterinaire: "#22C55E",
  autre: "#6B7280",
};

function getSectorColor(slug: string): string {
  return SECTOR_COLORS[slug] || "#0066FF";
}

function getSectorInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

// ---------------------------------------------------------------------------
// Custom Leaflet divIcon builder
// ---------------------------------------------------------------------------

function createMarkerIcon(
  sectorSlug: string,
  sectorName: string,
  isSelected: boolean
): L.DivIcon {
  const color = getSectorColor(sectorSlug);
  const initial = getSectorInitial(sectorName);
  const size = isSelected ? 48 : 36;
  const fontSize = isSelected ? 17 : 13;
  const borderWidth = isSelected ? 3 : 2;
  const shadow = isSelected
    ? `0 6px 20px ${color}60, 0 0 0 4px ${color}25`
    : `0 2px 8px rgba(0,0,0,0.2)`;
  const animClass = isSelected ? "marker-bounce" : "marker-idle";
  const pulseRing = isSelected
    ? `<div class="marker-pulse-ring" style="
        position: absolute;
        top: 50%; left: 50%;
        width: ${size + 20}px; height: ${size + 20}px;
        margin-top: -${(size + 20) / 2}px;
        margin-left: -${(size + 20) / 2}px;
        border-radius: 50%;
        border: 2px solid ${color};
        opacity: 0;
        animation: marker-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>`
    : "";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="${animClass}" style="position:relative; display:flex; align-items:center; justify-content:center;">
        ${pulseRing}
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          background: ${isSelected ? `linear-gradient(135deg, ${color}, ${color}dd)` : color};
          border: ${borderWidth}px solid white;
          box-shadow: ${shadow};
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-45deg);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-weight: 700;
            font-size: ${fontSize}px;
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          ">${initial}</span>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// ---------------------------------------------------------------------------
// Map fly-to helper component
// ---------------------------------------------------------------------------

function FlyToLocation({
  position,
  zoom,
}: {
  position: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      position &&
      Array.isArray(position) &&
      position.length === 2 &&
      typeof position[0] === "number" &&
      typeof position[1] === "number" &&
      !isNaN(position[0]) &&
      !isNaN(position[1]) &&
      isFinite(position[0]) &&
      isFinite(position[1])
    ) {
      // Delay flyTo slightly to ensure map container has rendered with proper size
      const timer = setTimeout(() => {
        try {
          const size = map.getSize();
          if (size.x > 0 && size.y > 0) {
            map.flyTo(position, zoom ?? 16, { duration: 0.8 });
          }
        } catch {
          // Silently ignore if map is not ready
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [map, position, zoom]);

  return null;
}

// ---------------------------------------------------------------------------
// Average rating helper
// ---------------------------------------------------------------------------

function getAvgRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

// ---------------------------------------------------------------------------
// MapView component
// ---------------------------------------------------------------------------

export default function MapView({ merchants, sectors }: MapViewProps) {
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // ---- Filtering ----
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const matchesSector = activeSector
        ? m.sector.slug === activeSector
        : true;
      const matchesSearch = searchQuery
        ? m.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
        : true;
      return matchesSector && matchesSearch;
    });
  }, [merchants, activeSector, searchQuery]);

  // ---- Handlers ----
  const handleSelectMerchant = useCallback(
    (merchantId: string) => {
      setSelectedMerchant(merchantId);
      const merchant = merchants.find((m) => m.id === merchantId);
      if (
        merchant?.latitude != null &&
        merchant?.longitude != null &&
        !isNaN(merchant.latitude) &&
        !isNaN(merchant.longitude)
      ) {
        setFlyTarget([merchant.latitude, merchant.longitude]);
      }
      // On mobile, switch to map when selecting from list
      if (mobileView === "list") {
        setMobileView("map");
      }
      // Scroll card into view in desktop sidebar
      const cardEl = cardRefs.current.get(merchantId);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    },
    [merchants, mobileView]
  );

  const handleMarkerClick = useCallback((merchantId: string) => {
    setSelectedMerchant(merchantId);
    const cardEl = cardRefs.current.get(merchantId);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  const handleSectorFilter = useCallback(
    (slug: string | null) => {
      setActiveSector(slug);
      setSelectedMerchant(null);
      // Reset map to default view when changing sector
      setFlyTarget(null);
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // ---- Render helpers ----

  const renderSectorChips = () => (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => handleSectorFilter(null)}
        className={cn(
          "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
          activeSector === null
            ? "bg-[#0066FF] text-white shadow-md shadow-blue-500/25"
            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
        )}
      >
        Tous
      </button>
      {sectors.map((sector) => {
        const color = getSectorColor(sector.slug);
        const isActive = activeSector === sector.slug;
        return (
          <button
            key={sector.id}
            onClick={() => handleSectorFilter(sector.slug)}
            className={cn(
              "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
              isActive
                ? "text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
            style={
              isActive
                ? { backgroundColor: color, boxShadow: `0 4px 12px ${color}40` }
                : undefined
            }
          >
            {sector.name}
          </button>
        );
      })}
    </div>
  );

  const renderSearchBar = () => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Rechercher un professionnel..."
        className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all placeholder:text-gray-400"
      />
      {searchQuery && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const renderMerchantCard = (merchant: MerchantWithDetails) => {
    const avgRating = getAvgRating(merchant.reviews);
    const isSelected = selectedMerchant === merchant.id;
    const firstService = merchant.services[0];
    const color = getSectorColor(merchant.sector.slug);

    return (
      <div
        key={merchant.id}
        ref={(el) => {
          if (el) cardRefs.current.set(merchant.id, el);
        }}
        onClick={() => handleSelectMerchant(merchant.id)}
        className={cn(
          "p-3.5 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md",
          isSelected
            ? "border-[#0066FF] bg-blue-50/50 shadow-md ring-1 ring-[#0066FF]/20"
            : "border-gray-100 bg-white hover:border-gray-200"
        )}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <div
            className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            {merchant.coverImage ? (
              <img
                src={merchant.coverImage}
                alt={merchant.businessName}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <span
                className="text-lg font-bold"
                style={{ color }}
              >
                {merchant.businessName[0]}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-gray-900 truncate">
                {merchant.businessName}
              </h3>
              {avgRating > 0 && (
                <span className="flex items-center gap-0.5 text-xs shrink-0">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-gray-700">
                    {avgRating.toFixed(1)}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                {merchant.sector.name}
              </span>
              {merchant.city && (
                <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                  <MapPin className="h-2.5 w-2.5" />
                  {merchant.city}
                </span>
              )}
            </div>

            {firstService && (
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-gray-500 truncate mr-2">
                  {firstService.name}
                </span>
                <span className="font-semibold text-[#0066FF] shrink-0">
                  {formatPrice(firstService.price)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMerchantList = () => (
    <div ref={listRef} className="space-y-2 overflow-y-auto flex-1 pr-1">
      {filteredMerchants.length > 0 ? (
        filteredMerchants.map(renderMerchantCard)
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <MapPin className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            Aucun professionnel trouvé
          </p>
          <p className="text-xs text-gray-400">
            Essayez de modifier vos filtres
          </p>
        </div>
      )}
    </div>
  );

  const renderMap = () => (
    <MapContainer
      center={[-17.535, -149.57]}
      zoom={13}
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <FlyToLocation position={flyTarget} />

      {filteredMerchants.map((merchant) => {
        if (merchant.latitude == null || merchant.longitude == null) return null;
        const isSelected = selectedMerchant === merchant.id;
        return (
          <Marker
            key={merchant.id}
            position={[merchant.latitude, merchant.longitude]}
            icon={createMarkerIcon(
              merchant.sector.slug,
              merchant.sector.name,
              isSelected
            )}
            eventHandlers={{
              click: () => handleMarkerClick(merchant.id),
            }}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Popup
              closeButton={true}
              maxWidth={300}
              className="merchant-popup"
            >
              <MerchantPopup merchant={merchant} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );

  // ---- Desktop layout ----
  const renderDesktop = () => (
    <div className="hidden md:flex h-full">
      {/* Side panel */}
      <div className="w-[420px] shrink-0 flex flex-col border-r border-gray-100 bg-gray-50/50">
        {/* Search + filters */}
        <div className="p-4 space-y-3 border-b border-gray-100 bg-white">
          {renderSearchBar()}
          {renderSectorChips()}
          <p className="text-xs text-gray-400">
            {filteredMerchants.length} professionnel
            {filteredMerchants.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Merchant list */}
        <div className="flex-1 overflow-y-auto p-3">
          {renderMerchantList()}
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative">{renderMap()}</div>
    </div>
  );

  // ---- Mobile layout ----
  const renderMobile = () => (
    <div className="md:hidden flex flex-col h-full relative">
      {/* Search + filter bar (always visible) */}
      <div className="p-3 space-y-2.5 bg-white border-b border-gray-100 z-10">
        {renderSearchBar()}
        {renderSectorChips()}
      </div>

      {/* Content: map or list */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {mobileView === "map" ? (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {renderMap()}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto p-3 bg-gray-50/50"
            >
              <p className="text-xs text-gray-400 mb-2">
                {filteredMerchants.length} professionnel
                {filteredMerchants.length !== 1 ? "s" : ""}
              </p>
              {renderMerchantList()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile toggle button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() =>
            setMobileView(mobileView === "map" ? "list" : "map")
          }
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0C1B2A] text-white rounded-full shadow-xl shadow-black/25 text-sm font-semibold hover:bg-[#0C1B2A]/90 transition-colors"
        >
          {mobileView === "map" ? (
            <>
              <List className="h-4 w-4" />
              Liste
            </>
          ) : (
            <>
              <MapIcon className="h-4 w-4" />
              Carte
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Global styles for Leaflet popups & marker animations */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        /* Marker idle hover effect */
        .marker-idle {
          transition: transform 0.2s ease;
        }
        .custom-marker:hover .marker-idle {
          transform: scale(1.15) translateY(-3px);
        }
        /* Marker bounce when selected */
        .marker-bounce {
          animation: marker-bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes marker-bounce-in {
          0% { transform: scale(0.6) translateY(10px); }
          50% { transform: scale(1.15) translateY(-8px); }
          70% { transform: scale(0.95) translateY(2px); }
          100% { transform: scale(1) translateY(0); }
        }
        /* Pulse ring around selected marker */
        @keyframes marker-ping {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .merchant-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          animation: popup-appear 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes popup-appear {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .merchant-popup .leaflet-popup-content {
          margin: 0;
          line-height: normal;
        }
        .merchant-popup .leaflet-popup-tip {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="h-full w-full">
        {renderDesktop()}
        {renderMobile()}
      </div>
    </>
  );
}
