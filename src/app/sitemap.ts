import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// All communes & islands in French Polynesia for GEO coverage
const VILLES_PF = [
  // Tahiti
  "Papeete", "Faa'a", "Punaauia", "Pirae", "Arue", "Mahina",
  "Paea", "Papara", "Taravao", "Teva I Uta", "Mataiea", "Afaahiti",
  "Toahotu", "Vairao",
  // Moorea
  "Moorea",
  // Iles Sous-le-Vent
  "Bora Bora", "Raiatea", "Tahaa", "Huahine",
  // Tuamotu
  "Rangiroa", "Tikehau", "Fakarava",
  // Marquises
  "Nuku Hiva", "Hiva Oa",
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[']/g, "")
    .replace(/\s+/g, "-");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [merchants, sectors] = await Promise.all([
    prisma.merchant.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    }),
    prisma.sector.findMany({
      select: { slug: true },
    }),
  ]);

  const now = new Date();

  // 1. Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: "https://bookeasy.me", lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: "https://bookeasy.me/search", lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: "https://bookeasy.me/sectors", lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: "https://bookeasy.me/map", lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: "https://bookeasy.me/pricing", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://bookeasy.me/gift-cards", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: "https://bookeasy.me/legal/mentions-legales", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: "https://bookeasy.me/legal/cgu", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: "https://bookeasy.me/legal/confidentialite", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // 2. Merchant pages
  const merchantPages: MetadataRoute.Sitemap = merchants.map((m) => ({
    url: `https://bookeasy.me/merchants/${m.id}`,
    lastModified: m.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Sector-only reservation pages (/reservation/coiffeur)
  const sectorPages: MetadataRoute.Sitemap = sectors.map((s) => ({
    url: `https://bookeasy.me/reservation/${s.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // 4. Sector x City reservation pages (/reservation/coiffeur-papeete) — 60+ pages
  const sectorCityPages: MetadataRoute.Sitemap = sectors.flatMap((s) =>
    VILLES_PF.map((city) => ({
      url: `https://bookeasy.me/reservation/${s.slug}-${toSlug(city)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  return [
    ...staticPages,
    ...merchantPages,
    ...sectorPages,
    ...sectorCityPages,
  ];
}
