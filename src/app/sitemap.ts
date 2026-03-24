import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const merchants = await prisma.merchant.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
  });

  const sectors = await prisma.sector.findMany({
    select: { slug: true },
  });

  const staticPages = [
    { url: "https://bookeasy.me", lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: "https://bookeasy.me/search", lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: "https://bookeasy.me/map", lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: "https://bookeasy.me/pricing", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "https://bookeasy.me/gift-cards", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "https://bookeasy.me/register", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "https://bookeasy.me/mentions-legales", lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: "https://bookeasy.me/cgu", lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: "https://bookeasy.me/confidentialite", lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const merchantPages = merchants.map((m) => ({
    url: `https://bookeasy.me/merchants/${m.id}`,
    lastModified: m.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const sectorPages = sectors.map((s) => ({
    url: `https://bookeasy.me/search?sector=${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...merchantPages, ...sectorPages];
}
