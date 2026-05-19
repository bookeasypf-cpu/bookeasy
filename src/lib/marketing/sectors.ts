/**
 * Palette + config minimal par secteur pour génération OG images.
 * Le slug doit matcher le slug Sector côté Prisma.
 * Fallback DEFAULT_PALETTE si secteur inconnu.
 */

export interface SectorPalette {
  primary: string;
  accent: string;
  deep: string;
  surface: string;
  emoji: string;
  tagline: string;
}

export const SECTOR_PALETTES: Record<string, SectorPalette> = {
  spa: {
    primary: "#0EA5A0", accent: "#F4E4C1", deep: "#0F1E2D", surface: "#FFFFFF",
    emoji: "🌺", tagline: "L'art du relâchement, réinventé.",
  },
  "institut-beaute": {
    primary: "#D946EF", accent: "#FDF2F8", deep: "#4A044E", surface: "#FFFFFF",
    emoji: "✨", tagline: "Ta beauté, sublimée.",
  },
  massage: {
    primary: "#059669", accent: "#D1FAE5", deep: "#064E3B", surface: "#FFFFFF",
    emoji: "💆", tagline: "Le toucher qui répare.",
  },
  "manucure-onglerie": {
    primary: "#EC4899", accent: "#FCE7F3", deep: "#831843", surface: "#FFFFFF",
    emoji: "💅", tagline: "Tes mains, ton style.",
  },
  maquillage: {
    primary: "#DC2626", accent: "#FEE2E2", deep: "#7F1D1D", surface: "#FFFFFF",
    emoji: "💄", tagline: "Ton jour J, sublimé.",
  },
  tatoueur: {
    primary: "#1E293B", accent: "#FCA5A5", deep: "#0F172A", surface: "#F8FAFC",
    emoji: "🎨", tagline: "L'art polynésien, ancré.",
  },
  barber: {
    primary: "#D97706", accent: "#FBBF24", deep: "#1C1917", surface: "#FAF3E0",
    emoji: "✂️", tagline: "Le rituel masculin.",
  },
  coiffeur: {
    primary: "#A855F7", accent: "#F3E8FF", deep: "#4C1D95", surface: "#FFFFFF",
    emoji: "💇", tagline: "Ta coiffure, sans attendre.",
  },
  "coach-sportif": {
    primary: "#EA580C", accent: "#FED7AA", deep: "#7C2D12", surface: "#FFFFFF",
    emoji: "💪", tagline: "Ta meilleure version, coachée.",
  },
  "medecin-generaliste": {
    primary: "#0284C7", accent: "#E0F2FE", deep: "#075985", surface: "#FFFFFF",
    emoji: "🩺", tagline: "Ta santé, sans la salle d'attente.",
  },
  dentiste: {
    primary: "#06B6D4", accent: "#CFFAFE", deep: "#164E63", surface: "#FFFFFF",
    emoji: "🦷", tagline: "Ton sourire, soigné.",
  },
  osteopathe: {
    primary: "#0891B2", accent: "#A5F3FC", deep: "#155E75", surface: "#FFFFFF",
    emoji: "🧘", tagline: "Le corps, remis en équilibre.",
  },
  kinesitherapeute: {
    primary: "#0EA5E9", accent: "#BAE6FD", deep: "#0C4A6E", surface: "#FFFFFF",
    emoji: "🦵", tagline: "Rééduquer, retrouver, repartir.",
  },
  infirmier: {
    primary: "#10B981", accent: "#D1FAE5", deep: "#064E3B", surface: "#FFFFFF",
    emoji: "💉", tagline: "Soins à domicile, sans complication.",
  },
};

export const DEFAULT_PALETTE: SectorPalette = {
  primary: "#0066FF",
  accent: "#00B4D8",
  deep: "#0C1B2A",
  surface: "#FFFFFF",
  emoji: "📍",
  tagline: "Réserver en 2 clics en Polynésie.",
};

export function getPalette(sectorSlug?: string | null): SectorPalette {
  if (!sectorSlug) return DEFAULT_PALETTE;
  return SECTOR_PALETTES[sectorSlug] ?? DEFAULT_PALETTE;
}

export type OgTemplate = "hero" | "ui" | "testimonial";
export type OgFormat = "square" | "story";

export const OG_DIMENSIONS: Record<OgFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};
