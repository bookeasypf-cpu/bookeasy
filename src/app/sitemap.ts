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
    { url: "https://bookeasy.pf", lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: "https://bookeasy.pf/search", lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: "https://bookeasy.pf/map", lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: "https://bookeasy.pf/pricing", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "https://bookeasy.pf/gift-cards", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "https://bookeasy.pf/register", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "https://bookeasy.pf/mentions-legales", lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: "https://bookeasy.pf/cgu", lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: "https://bookeasy.pf/confidentialite", lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const merchantPages = merchants.map((m) => ({
    url: `https://bookeasy.pf/merchants/${m.id}`,
    lastModified: m.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const sectorPages = sectors.map((s) => ({
    url: `https://bookeasy.pf/search?sector=${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...merchantPages, ...sectorPages];
}
