export const SECTORS = [
  // Beauté & Bien-être
  { name: "Coiffeur", slug: "coiffeur", icon: "Scissors" },
  { name: "Barber", slug: "barber", icon: "Scissors" },
  { name: "Esthéticienne", slug: "estheticienne", icon: "Sparkles" },
  { name: "Spa & Bien-être", slug: "spa", icon: "Droplets" },
  { name: "Manucure & Onglerie", slug: "manucure", icon: "Hand" },
  { name: "Massage", slug: "massage", icon: "Heart" },
  { name: "Maquillage", slug: "maquillage", icon: "Palette" },
  { name: "Tatoueur", slug: "tatoueur", icon: "Pen" },
  // Santé
  { name: "Médecin généraliste", slug: "medecin-generaliste", icon: "Stethoscope" },
  { name: "Dentiste", slug: "dentiste", icon: "SmilePlus" },
  { name: "Kinésithérapeute", slug: "kinesitherapeute", icon: "Activity" },
  { name: "Infirmier(ère)", slug: "infirmier", icon: "Cross" },
  { name: "Psychologue", slug: "psychologue", icon: "Brain" },
  { name: "Opticien", slug: "opticien", icon: "Eye" },
  { name: "Ostéopathe", slug: "osteopathe", icon: "Bone" },
  { name: "Diététicien(ne)", slug: "dieteticien", icon: "Apple" },
  { name: "Nutritionniste", slug: "nutritionniste", icon: "Apple" },
  { name: "Médecin", slug: "medecin", icon: "Stethoscope" },
  { name: "Vétérinaire", slug: "veterinaire", icon: "PawPrint" },
  // Sport & Loisirs
  { name: "Coach sportif", slug: "coach-sportif", icon: "Dumbbell" },
  { name: "Plongée", slug: "plongee", icon: "Waves" },
  { name: "Yoga & Pilates", slug: "yoga-pilates", icon: "Flame" },
  { name: "Excursion & Tour", slug: "excursion", icon: "Compass" },
  // Services pro
  { name: "Photographe", slug: "photographe", icon: "Camera" },
  { name: "Auto-école", slug: "auto-ecole", icon: "Car" },
  { name: "Mécanicien", slug: "mecanicien", icon: "Wrench" },
  { name: "Pressing & Couture", slug: "pressing", icon: "Shirt" },
  { name: "Cours particulier", slug: "cours-particulier", icon: "GraduationCap" },
  // Autre
  { name: "Autre", slug: "autre", icon: "Store" },
] as const;

export const BOOKING_STATUSES = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED_BY_CLIENT: "CANCELLED_BY_CLIENT",
  CANCELLED_BY_MERCHANT: "CANCELLED_BY_MERCHANT",
  COMPLETED: "COMPLETED",
  NO_SHOW: "NO_SHOW",
} as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  PENDING_PAYMENT: "Paiement en cours",
  CONFIRMED: "Confirmé",
  CANCELLED_BY_CLIENT: "Annulé par le client",
  CANCELLED_BY_MERCHANT: "Annulé par le pro",
  COMPLETED: "Terminé",
  NO_SHOW: "Absent",
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PENDING_PAYMENT: "bg-orange-100 text-orange-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED_BY_CLIENT: "bg-red-100 text-red-800",
  CANCELLED_BY_MERCHANT: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

export const ROLES = {
  CLIENT: "CLIENT",
  MERCHANT: "MERCHANT",
  ADMIN: "ADMIN",
} as const;

export const SLOT_INTERVAL = 15; // minutes between available slots

export const DAYS_OF_WEEK = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
] as const;

export const MAX_BOOKING_DAYS_AHEAD = 60;
