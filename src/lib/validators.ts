import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum(["CLIENT", "MERCHANT"]),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const merchantProfileSchema = z.object({
  businessName: z.string().min(2, "Nom requis"),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  sectorId: z.string().min(1, "Secteur requis"),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Nom du service requis"),
  description: z.string().optional(),
  duration: z.number().min(5, "Durée minimum 5 min").max(480, "Durée maximum 8h"),
  price: z.number().min(0, "Prix invalide"),
});

export const bookingSchema = z.object({
  merchantId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide"),
  notes: z.string().optional(),
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MerchantProfileInput = z.infer<typeof merchantProfileSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
