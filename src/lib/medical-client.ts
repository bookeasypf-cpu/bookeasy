// Client-side medical sector detection (mirrors server-side)
export const MEDICAL_SECTOR_SLUGS = [
  "medecin-generaliste",
  "dentiste",
  "kinesitherapeute",
  "infirmier",
  "infirmier-ere",
  "psychologue",
  "opticien",
  "osteopathe",
  "dieteticien",
  "dieteticien-ne",
  "nutritionniste",
  "medecin",
];

export function isMedicalSectorClient(sectorSlug: string | null | undefined): boolean {
  if (!sectorSlug) return false;
  return MEDICAL_SECTOR_SLUGS.includes(sectorSlug);
}
