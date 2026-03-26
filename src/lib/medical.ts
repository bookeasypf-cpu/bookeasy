// Secteurs médicaux réglementés — pas de système XP/réductions
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

// Vétérinaire n'est PAS considéré médical (peut faire des promos)

export function isMedicalSector(sectorSlug: string | null | undefined): boolean {
  if (!sectorSlug) return false;
  return MEDICAL_SECTOR_SLUGS.includes(sectorSlug);
}

export function isMedicalSectorName(sectorName: string | null | undefined): boolean {
  if (!sectorName) return false;
  const medicalNames = [
    "Médecin généraliste",
    "Dentiste",
    "Kinésithérapeute",
    "Infirmier(ère)",
    "Psychologue",
    "Opticien",
    "Ostéopathe",
    "Diététicien(ne)",
    "Nutritionniste",
    "Médecin",
  ];
  return medicalNames.includes(sectorName);
}

// Labels adaptés pour le contexte médical
export const MEDICAL_LABELS = {
  service: "Consultation",
  services: "Consultations",
  addService: "Nouvelle consultation",
  editService: "Modifier la consultation",
  booking: "Rendez-vous médical",
  bookings: "Rendez-vous médicaux",
  client: "Patient",
  clients: "Patients",
  revenue: "Honoraires",
  price: "Tarif consultation",
  xpPerBooking: "Points fidélité",
  loyalty: "Suivi patients",
  analytics: "Statistiques médicales",
  noShow: "RDV non honoré",
  completed: "Consultation effectuée",
};

// Labels standard pour les autres secteurs
export const STANDARD_LABELS = {
  service: "Service",
  services: "Services",
  addService: "Nouveau service",
  editService: "Modifier le service",
  booking: "Rendez-vous",
  bookings: "Rendez-vous",
  client: "Client",
  clients: "Clients",
  revenue: "Revenu",
  price: "Prix",
  xpPerBooking: "XP par réservation",
  loyalty: "Fidélité XP",
  analytics: "Statistiques",
  noShow: "Non présenté",
  completed: "Terminé",
};

export function getLabels(isMedical: boolean) {
  return isMedical ? MEDICAL_LABELS : STANDARD_LABELS;
}
