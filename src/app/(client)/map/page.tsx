import { prisma } from "@/lib/prisma";
import MapViewLoader from "@/components/map/MapViewLoader";

export const metadata = {
  title: "Explorer la carte | BookEasy",
  description:
    "Trouvez les meilleurs professionnels autour de vous en Polynésie française.",
};

interface MapPageProps {
  searchParams: Promise<{ sector?: string; q?: string; city?: string }>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const initialSector = params.sector || null;
  const [merchants, sectors] = await Promise.all([
    prisma.merchant.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        sector: true,
        services: {
          where: { isActive: true },
          take: 5,
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { businessName: "asc" },
    }),
    prisma.sector.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedMerchants = merchants.map((m) => ({
    id: m.id,
    businessName: m.businessName,
    description: m.description,
    phone: m.phone,
    address: m.address,
    city: m.city,
    latitude: m.latitude,
    longitude: m.longitude,
    coverImage: m.coverImage,
    sector: {
      id: m.sector.id,
      name: m.sector.name,
      slug: m.sector.slug,
      icon: m.sector.icon || "",
    },
    services: m.services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
    })),
    reviews: m.reviews.map((r) => ({ rating: r.rating })),
  }));

  const serializedSectors = sectors.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    icon: s.icon || "",
  }));

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <MapViewLoader
        merchants={serializedMerchants}
        sectors={serializedSectors}
        initialSector={initialSector}
      />
    </div>
  );
}
