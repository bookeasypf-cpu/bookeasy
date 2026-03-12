export const SECTORS = [
  { name: "Coiffeur", slug: "coiffeur", icon: "Scissors" },
  { name: "Barber", slug: "barber", icon: "Scissors" },
  { name: "Esthéticienne", slug: "estheticienne", icon: "Sparkles" },
  { name: "Spa & Bien-être", slug: "spa", icon: "Droplets" },
  { name: "Manucure & Onglerie", slug: "manucure", icon: "Hand" },
  { name: "Massage", slug: "massage", icon: "Heart" },
  { name: "Dentiste", slug: "dentiste", icon: "Stethoscope" },
  { name: "Médecin", slug: "medecin", icon: "Stethoscope" },
  { name: "Kinésithérapeute", slug: "kinesitherapeute", icon: "Activity" },
  { name: "Tatoueur", slug: "tatoueur", icon: "Pen" },
  { name: "Coach sportif", slug: "coach-sportif", icon: "Dumbbell" },
  { name: "Photographe", slug: "photographe", icon: "Camera" },
  { name: "Mécanicien auto", slug: "mecanicien", icon: "Wrench" },
  { name: "Vétérinaire", slug: "veterinaire", icon: "PawPrint" },
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
  CONFIRMED: "Confirmé",
  CANCELLED_BY_CLIENT: "Annulé par le client",
  CANCELLED_BY_MERCHANT: "Annulé par le pro",
  COMPLETED: "Terminé",
  NO_SHOW: "Absent",
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
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
