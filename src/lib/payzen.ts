import crypto from "crypto";

// ─────────────────────────────────────────────
// PayZen by OSB — Configuration
// ─────────────────────────────────────────────
// Après avoir contacté OSB (commercial@osb.pf / 40 54 08 00),
// vous recevrez vos identifiants à mettre dans .env :
//
// PAYZEN_SHOP_ID=votre_shop_id
// PAYZEN_KEY_TEST=votre_cle_test
// PAYZEN_KEY_PROD=votre_cle_prod
// PAYZEN_MODE=TEST (ou PRODUCTION)
// PAYZEN_IPN_URL=https://bookeasy-eta.vercel.app/api/payzen/ipn

const SHOP_ID = process.env.PAYZEN_SHOP_ID || "";
const KEY_TEST = process.env.PAYZEN_KEY_TEST || "";
const KEY_PROD = process.env.PAYZEN_KEY_PROD || "";
const MODE = process.env.PAYZEN_MODE || "TEST";

export const PAYZEN_CONFIGURED = !!SHOP_ID && !!(MODE === "TEST" ? KEY_TEST : KEY_PROD);

if (!PAYZEN_CONFIGURED) {
  console.warn("⚠️ PayZen non configuré — paiement désactivé");
}

// Prix de l'abonnement Pro
export const PRO_PRICE_XPF = 7800;
export const PRO_PRICE_DISPLAY = "7 800 F CFP";

// URL de la plateforme PayZen by OSB
const PAYZEN_URL = "https://secure.osb.pf/vads-payment/";

function getKey(): string {
  return MODE === "TEST" ? KEY_TEST : KEY_PROD;
}

/**
 * Calcule la signature HMAC-SHA256 pour un formulaire PayZen.
 * PayZen exige de trier les champs vads_* par ordre alphabétique,
 * les concaténer avec '+', puis ajouter la clé.
 */
export function computeSignature(fields: Record<string, string>): string {
  const vadsFields = Object.keys(fields)
    .filter((k) => k.startsWith("vads_"))
    .sort();
  const values = vadsFields.map((k) => fields[k]);
  values.push(getKey());
  const signatureString = values.join("+");
  return crypto
    .createHmac("sha256", getKey())
    .update(signatureString)
    .digest("base64");
}

/**
 * Vérifie la signature d'une notification IPN PayZen
 */
export function verifySignature(fields: Record<string, string>, receivedSignature: string): boolean {
  const computed = computeSignature(fields);
  return computed === receivedSignature;
}

/**
 * Génère un identifiant de transaction unique (6 chiffres)
 */
function generateTransId(): string {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const secondsSinceMidnight = Math.floor((now.getTime() - dayStart.getTime()) / 1000);
  return String(secondsSinceMidnight).padStart(6, "0");
}

interface PaymentFormParams {
  merchantId: string;
  merchantEmail: string;
  amount: number; // en XPF (ex: 7800)
  orderId: string;
  isSubscription?: boolean;
}

interface BookingPaymentParams {
  bookingId: string;
  clientEmail: string;
  amount: number; // en XPF
  orderId: string;
}

/**
 * Génère les champs du formulaire de paiement PayZen.
 * Le frontend affiche un formulaire HTML avec ces champs cachés
 * qui redirige vers la page de paiement OSB.
 */
export function createPaymentForm(params: PaymentFormParams): {
  actionUrl: string;
  fields: Record<string, string>;
} {
  const now = new Date();
  const transmissionDate = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);

  const baseUrl = process.env.NEXTAUTH_URL || "https://bookeasy-eta.vercel.app";

  const fields: Record<string, string> = {
    vads_action_mode: "INTERACTIVE",
    vads_amount: String(params.amount), // PayZen XPF = montant en unités (pas de centimes)
    vads_ctx_mode: MODE,
    vads_currency: "953", // Code ISO 4217 pour XPF
    vads_cust_email: params.merchantEmail,
    vads_order_id: params.orderId,
    vads_page_action: "PAYMENT",
    vads_payment_config: "SINGLE",
    vads_return_mode: "POST",
    vads_site_id: SHOP_ID,
    vads_trans_date: transmissionDate,
    vads_trans_id: generateTransId(),
    vads_url_cancel: `${baseUrl}/pricing`,
    vads_url_error: `${baseUrl}/pricing?error=payment`,
    vads_url_refused: `${baseUrl}/pricing?error=refused`,
    vads_url_return: `${baseUrl}/dashboard/profile?upgrade=pending`,
    vads_url_success: `${baseUrl}/dashboard/profile?upgrade=success`,
    vads_version: "V2",
    // Métadonnées pour identifier le commerçant dans l'IPN
    vads_ext_info_merchantId: params.merchantId,
    vads_ext_info_type: "PRO_SUBSCRIPTION",
  };

  // Pour les abonnements récurrents, PayZen utilise un mode spécial
  if (params.isSubscription) {
    fields.vads_payment_config = "SINGLE"; // Premier paiement simple
    // Le récurrent sera géré manuellement via l'IPN + renouvellement
    // OSB recommande de gérer les abonnements côté serveur
    // avec rappel mensuel et nouveau formulaire de paiement
  }

  // Calculer la signature
  fields.signature = computeSignature(fields);

  return {
    actionUrl: PAYZEN_URL,
    fields,
  };
}

/**
 * Génère les champs du formulaire de paiement pour une réservation.
 */
export function createBookingPaymentForm(params: BookingPaymentParams): {
  actionUrl: string;
  fields: Record<string, string>;
} {
  const now = new Date();
  const transmissionDate = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const baseUrl = process.env.NEXTAUTH_URL || "https://bookeasy-eta.vercel.app";

  const fields: Record<string, string> = {
    vads_action_mode: "INTERACTIVE",
    vads_amount: String(params.amount),
    vads_ctx_mode: MODE,
    vads_currency: "953",
    vads_cust_email: params.clientEmail,
    vads_order_id: params.orderId,
    vads_page_action: "PAYMENT",
    vads_payment_config: "SINGLE",
    vads_return_mode: "POST",
    vads_site_id: SHOP_ID,
    vads_trans_date: transmissionDate,
    vads_trans_id: generateTransId(),
    vads_url_cancel: `${baseUrl}/booking/confirmation/${params.bookingId}?payment=cancelled`,
    vads_url_error: `${baseUrl}/booking/confirmation/${params.bookingId}?payment=failed`,
    vads_url_refused: `${baseUrl}/booking/confirmation/${params.bookingId}?payment=failed`,
    vads_url_return: `${baseUrl}/booking/confirmation/${params.bookingId}?payment=pending`,
    vads_url_success: `${baseUrl}/booking/confirmation/${params.bookingId}?payment=success`,
    vads_version: "V2",
    vads_ext_info_bookingId: params.bookingId,
    vads_ext_info_type: "BOOKING_PAYMENT",
  };

  fields.signature = computeSignature(fields);

  return { actionUrl: PAYZEN_URL, fields };
}

interface GiftCardPaymentParams {
  giftCardId: string;
  buyerEmail: string;
  amount: number; // en XPF
  orderId: string;
}

/**
 * Génère les champs du formulaire de paiement pour une carte cadeau.
 */
export function createGiftCardPaymentForm(params: GiftCardPaymentParams): {
  actionUrl: string;
  fields: Record<string, string>;
} {
  const now = new Date();
  const transmissionDate = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const baseUrl = process.env.NEXTAUTH_URL || "https://bookeasy-eta.vercel.app";

  const fields: Record<string, string> = {
    vads_action_mode: "INTERACTIVE",
    vads_amount: String(params.amount),
    vads_ctx_mode: MODE,
    vads_currency: "953",
    vads_cust_email: params.buyerEmail,
    vads_order_id: params.orderId,
    vads_page_action: "PAYMENT",
    vads_payment_config: "SINGLE",
    vads_return_mode: "POST",
    vads_site_id: SHOP_ID,
    vads_trans_date: transmissionDate,
    vads_trans_id: generateTransId(),
    vads_url_cancel: `${baseUrl}/gift-cards/confirmation/${params.giftCardId}?payment=cancelled`,
    vads_url_error: `${baseUrl}/gift-cards/confirmation/${params.giftCardId}?payment=failed`,
    vads_url_refused: `${baseUrl}/gift-cards/confirmation/${params.giftCardId}?payment=failed`,
    vads_url_return: `${baseUrl}/gift-cards/confirmation/${params.giftCardId}?payment=pending`,
    vads_url_success: `${baseUrl}/gift-cards/confirmation/${params.giftCardId}?payment=success`,
    vads_version: "V2",
    vads_ext_info_giftCardId: params.giftCardId,
    vads_ext_info_type: "GIFT_CARD_PAYMENT",
  };

  fields.signature = computeSignature(fields);

  return { actionUrl: PAYZEN_URL, fields };
}

/**
 * Analyse les données IPN de PayZen et retourne les infos utiles
 */
export function parseIPNData(body: Record<string, string>) {
  return {
    transactionStatus: body.vads_trans_status,
    orderId: body.vads_order_id,
    merchantId: body.vads_ext_info_merchantId,
    bookingId: body.vads_ext_info_bookingId,
    giftCardId: body.vads_ext_info_giftCardId,
    type: body.vads_ext_info_type,
    amount: parseInt(body.vads_amount || "0"),
    transId: body.vads_trans_id,
    authResult: body.vads_auth_result,
    paymentType: body.vads_payment_config,
  };
}
