import { z } from "zod";
import type { ZodError } from "zod";

/** Extract first human-readable error message from a ZodError (Zod 4 compatible) */
export function zodFirstError(error: ZodError): string {
  return error.issues?.[0]?.message || "Données invalides";
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide").max(254),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(128),
  // bcrypt truncates at 72 bytes — enforce that as max
  password: z.string().min(6, "Min. 6 caractères").max(72),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url().max(2048),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().email("Email invalide").max(254),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(72),
  acceptCgu: z.literal("true", { message: "Vous devez accepter les CGU et la politique de confidentialité" }),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide").max(254),
  password: z.string().min(1, "Mot de passe requis").max(72),
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1).max(40),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const bookingSchema = z.object({
  merchantId: z.string().min(1).max(40),
  serviceId: z.string().min(1).max(40),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide"),
  notes: z.string().max(1000).optional(),
  giftCardCode: z.string().max(20).optional(),
  paymentMethod: z.enum(["online", "on_site"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;

// ─────────────────────────────────────────────
// DASHBOARD — SERVICES
// ─────────────────────────────────────────────

// Defense in depth: les clients peuvent envoyer `null` pour les champs
// optionnels (xpAmount vide, description vide). On accepte null + on
// normalise vers undefined pour que Prisma reçoive du clean.
const optionalServiceDescription = z
  .string()
  .max(500)
  .nullable()
  .optional()
  .transform((v) => v ?? undefined);

const optionalServiceXp = z.coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .nullable()
  .optional()
  .transform((v) => v ?? undefined);

export const createServiceSchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  duration: z.coerce.number().int().min(5, "Durée min. 5 min").max(480),
  price: z.coerce.number().min(0, "Prix invalide").max(10_000_000),
  description: optionalServiceDescription,
  xpAmount: optionalServiceXp,
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  duration: z.coerce.number().int().min(5).max(480).optional(),
  price: z.coerce.number().min(0).max(10_000_000).optional(),
  description: optionalServiceDescription,
  xpAmount: optionalServiceXp,
});

// ─────────────────────────────────────────────
// DASHBOARD — PROFILE
// ─────────────────────────────────────────────

export const updateMerchantProfileSchema = z.object({
  businessName: z.string().min(1, "Nom requis").max(100),
  sectorId: z.string().min(1, "Secteur requis"),
  description: z.string().max(2000).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  address: z.string().max(200).optional().default(""),
  city: z.string().max(100).optional().default(""),
  postalCode: z.string().max(10).optional().default(""),
});

export const updatePaymentPolicySchema = z.object({
  paymentPolicy: z.enum(["NONE", "FLEXIBLE", "ONLINE_ONLY"]),
});

// ─────────────────────────────────────────────
// DASHBOARD — AVAILABILITY
// ─────────────────────────────────────────────

const scheduleItemSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  isActive: z.boolean(),
});

export const updateAvailabilitySchema = z.object({
  schedule: z.array(scheduleItemSchema).optional().default([]),
});

// ─────────────────────────────────────────────
// DASHBOARD — SUPPORT
// ─────────────────────────────────────────────

export const supportMessageSchema = z.object({
  subject: z.string().min(1, "Sujet requis").max(200),
  message: z.string().min(1, "Message requis").max(2000),
});

// ─────────────────────────────────────────────
// DASHBOARD — PHOTOS
// ─────────────────────────────────────────────

// Photo URLs MUST come from our own Blob store. Without this guard, a
// malicious or buggy client could persist any URL — including a tracking
// pixel or a domain not whitelisted in next.config remotePatterns,
// which makes next/image throw a 500 at render time (= invisible image
// with no clear error to debug).
const isAllowedPhotoUrl = (url: string) =>
  /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(url);

export const addPhotoSchema = z.object({
  url: z
    .string()
    .url("URL invalide")
    .refine(isAllowedPhotoUrl, "URL non autorisée (doit être sur Vercel Blob)"),
  caption: z.string().max(200).optional().default(""),
});

export const updateCoverSchema = z.object({
  coverImage: z
    .string()
    .url()
    .refine(isAllowedPhotoUrl, "URL non autorisée")
    .nullable()
    .optional(),
});

// ─────────────────────────────────────────────
// DASHBOARD — XP REWARDS
// ─────────────────────────────────────────────

export const createXpRewardSchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  xpCost: z.coerce.number().int().min(1, "Coût min. 1 XP").max(10000),
  description: z.string().max(500).optional().default(""),
  type: z.string().max(50).optional().default("DISCOUNT"),
  value: z.any().optional(),
  maxUses: z.coerce.number().int().min(1).optional().nullable(),
});

export const updateXpRewardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  xpCost: z.coerce.number().int().min(1).max(10000).optional(),
  type: z.string().max(50).optional(),
  value: z.any().optional(),
  isActive: z.boolean().optional(),
  maxUses: z.coerce.number().int().min(1).optional().nullable(),
});

// ─────────────────────────────────────────────
// DASHBOARD — XP SETTINGS
// ─────────────────────────────────────────────

export const updateXpSettingsSchema = z.object({
  xpPerBooking: z.coerce.number().int().min(1).max(100),
});

// ─────────────────────────────────────────────
// DASHBOARD — VALIDATE CODE
// ─────────────────────────────────────────────

export const validateCodeSchema = z.object({
  code: z.string().min(1, "Code requis").max(50),
});

// ─────────────────────────────────────────────
// DASHBOARD — PATIENT NOTES
// ─────────────────────────────────────────────

export const createPatientNoteSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  content: z.string().min(1, "Note requise").max(5000),
});

// ─────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────

export const updateUserProfileSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100),
  phone: z.string().max(30).optional().default(""),
  image: z.string().url().optional().nullable(),
});

// ─────────────────────────────────────────────
// GIFT CARDS
// ─────────────────────────────────────────────

const ALLOWED_AMOUNTS = [2000, 5000, 10000, 20000, 50000] as const;

export const createGiftCardSchema = z.object({
  amountXPF: z.coerce.number().refine(
    (v) => (ALLOWED_AMOUNTS as readonly number[]).includes(v),
    { message: "Montant invalide" }
  ),
  senderName: z.string().min(1, "Nom requis").max(100),
  senderEmail: z.string().email("Email invalide"),
  recipientName: z.string().min(1, "Nom du destinataire requis").max(100),
  recipientEmail: z.string().email("Email du destinataire invalide"),
  message: z.string().max(500).optional().default(""),
  merchantId: z.string().optional().nullable(),
});

// ─────────────────────────────────────────────
// FAVORITES
// ─────────────────────────────────────────────

export const toggleFavoriteSchema = z.object({
  merchantId: z.string().min(1, "Merchant ID requis"),
});

// ─────────────────────────────────────────────
// PUSH NOTIFICATIONS
// ─────────────────────────────────────────────

export const pushSubscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
});

// ─────────────────────────────────────────────
// QUICK REGISTER
// ─────────────────────────────────────────────

export const quickRegisterSchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide").max(254),
  phone: z.string().max(30).optional().default(""),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(72),
  sectorId: z.string().min(1, "Choisissez votre secteur d'activité").max(40),
  plan: z.enum(["free", "pro"]).optional().default("free"),
  acceptCgu: z.literal(true, { message: "Vous devez accepter les CGU et la politique de confidentialité" }),
});

// ─────────────────────────────────────────────
// XP REDEEM
// ─────────────────────────────────────────────

export const redeemXpSchema = z.object({
  rewardId: z.string().min(1, "Récompense requise"),
});

// ─────────────────────────────────────────────
// PAYZEN
// ─────────────────────────────────────────────

export const bookingCheckoutSchema = z.object({
  bookingId: z.string().min(1, "Booking ID requis"),
});

export const giftCardCheckoutSchema = z.object({
  giftCardId: z.string().min(1, "Gift card ID requis"),
});
