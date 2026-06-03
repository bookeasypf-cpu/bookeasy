import { prisma } from "@/lib/prisma";
import {
  type BillingCycle,
  FOUNDER_DISCOUNT_MULTIPLIER,
  MAX_FOUNDER_SLOTS,
  PRO_PRICE_MONTHLY_XPF,
  PRO_PRICE_YEARLY_XPF,
} from "@/lib/constants";

/**
 * Combien de places "Tarif fondateur" restent disponibles.
 * Returns 0 if all slots are taken. Never negative.
 *
 * Fail-open to 0 on DB error: si on ne peut pas vérifier, on n'offre pas
 * le tarif fondateur. Plus sûr que de l'offrir et de devoir le retirer
 * ensuite.
 */
export async function getFounderSlotsLeft(): Promise<number> {
  try {
    const taken = await prisma.merchant.count({
      where: { isFounderPricing: true },
    });
    return Math.max(0, MAX_FOUNDER_SLOTS - taken);
  } catch {
    return 0;
  }
}

/**
 * Prix à facturer en F CFP (entier) pour un upgrade Pro.
 * Centralise la logique pour que le checkout PayZen, l'IPN, l'email
 * welcome et la page pricing utilisent tous le même calcul.
 */
export function computeProPrice(
  cycle: BillingCycle,
  isFounder: boolean
): number {
  const base = cycle === "YEARLY" ? PRO_PRICE_YEARLY_XPF : PRO_PRICE_MONTHLY_XPF;
  if (!isFounder) return base;
  return Math.round(base * FOUNDER_DISCOUNT_MULTIPLIER);
}

/**
 * Date d'expiration du plan Pro selon le cycle choisi, calculée depuis now.
 * Utilisé à la confirmation IPN PayZen.
 */
export function computePlanExpiresAt(cycle: BillingCycle): Date {
  const expires = new Date();
  if (cycle === "YEARLY") {
    expires.setFullYear(expires.getFullYear() + 1);
  } else {
    expires.setMonth(expires.getMonth() + 1);
  }
  return expires;
}
