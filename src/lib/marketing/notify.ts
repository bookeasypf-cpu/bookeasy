/**
 * Notification admin pour pipeline marketing.
 *
 * Quand un événement marketing-worthy se produit (signup, upgrade Pro),
 * envoie un email à l'admin avec preview du visuel auto-généré
 * + caption pré-remplie + lien direct pour publier sur les réseaux.
 *
 * Fire-and-forget : ne bloque jamais l'action principale.
 */
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "BookEasy <noreply@bookeasy.me>";
const ADMIN_EMAIL = process.env.MARKETING_ADMIN_EMAIL || process.env.SUPPORT_EMAIL || "bookeasy.pf@gmail.com";
const BASE_URL = process.env.NEXTAUTH_URL || "https://bookeasy.me";

export type MarketingEvent = "welcome" | "upgrade";

interface NotifyOptions {
  event: MarketingEvent;
  merchantId: string;
}

const EVENT_CONFIG = {
  welcome: {
    subject: "👋 Nouveau marchand free — Welcome post prêt à publier",
    headline: "Nouveau marchand inscrit",
    description: "Un commerce vient de rejoindre BookEasy en plan Free. Voici son visuel Welcome prêt à partager en story Instagram + Facebook.",
    template: "ui" as const,
    captionTemplate: (name: string, city: string, sector: string) =>
`🌺 Bienvenue à ${name} sur BookEasy !

📍 ${city || "Polynésie"} · ${sector}

👉 Découvre sur bookeasy.me

#NouveauSurBookEasy #${sector.replace(/\s+/g, "")}PF #BookEasy`,
    priority: "Story IG + post FB · ton léger",
    badgeColor: "#10B981",
  },
  upgrade: {
    subject: "🚀 Marchand UPGRADE PRO — Post premium à booster",
    headline: "Upgrade Plan Pro",
    description: "Un marchand vient de passer en Plan Pro. Visuel premium avec sa vraie photo. Boost payé recommandé 5 000-10 000 XPF.",
    template: "hero" as const,
    captionTemplate: (name: string, city: string, sector: string) =>
`🚀 ${name} passe en PRO sur BookEasy !

✓ Visible sur Google et ChatGPT
✓ Page boutique optimisée SEO/GEO
✓ Réservations 24/7

Découvre en exclusivité :
👉 bookeasy.me

#BookEasyPro #${sector.replace(/\s+/g, "")}PF #Tahiti #${name.replace(/\s+/g, "")}Pro`,
    priority: "🔥 POST CLÉ : Insta + FB + TikTok · BOOST PAYÉ 5-10k XPF",
    badgeColor: "#EC4899",
  },
} as const;

export async function notifyAdminMarketingEvent({ event, merchantId }: NotifyOptions): Promise<void> {
  if (!resend) {
    console.warn("[marketing/notify] Resend not configured — skipping");
    return;
  }

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        businessName: true,
        city: true,
        plan: true,
        coverImage: true,
        sector: { select: { name: true } },
      },
    });

    if (!merchant) {
      console.warn(`[marketing/notify] Merchant ${merchantId} not found`);
      return;
    }

    const cfg = EVENT_CONFIG[event];
    const sectorName = merchant.sector?.name ?? "Polynésie";
    const cityName = merchant.city ?? "Polynésie";

    const previewSquare = `${BASE_URL}/api/marketing/og?merchantId=${merchantId}&template=${cfg.template}&format=square`;
    const previewStory = `${BASE_URL}/api/marketing/og?merchantId=${merchantId}&template=${cfg.template}&format=story`;
    const caption = cfg.captionTemplate(merchant.businessName, cityName, sectorName);

    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: cfg.subject,
      replyTo: ADMIN_EMAIL,
      html: renderEmailHtml({
        event,
        merchant: { businessName: merchant.businessName, city: cityName, sector: sectorName, plan: merchant.plan },
        previewSquare,
        previewStory,
        caption,
        priority: cfg.priority,
        headline: cfg.headline,
        description: cfg.description,
        badgeColor: cfg.badgeColor,
        merchantId,
      }),
    });
  } catch (err) {
    console.error("[marketing/notify] Failed to send notification:", err instanceof Error ? err.message : err);
  }
}

function renderEmailHtml(opts: {
  event: MarketingEvent;
  merchant: { businessName: string; city: string; sector: string; plan: string };
  previewSquare: string;
  previewStory: string;
  caption: string;
  priority: string;
  headline: string;
  description: string;
  badgeColor: string;
  merchantId: string;
}): string {
  const { merchant, previewSquare, previewStory, caption, priority, headline, description, badgeColor, merchantId } = opts;

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;color:#fff;">
  <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:${badgeColor};color:#fff;padding:6px 14px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${headline}</div>
      <h1 style="margin:16px 0 8px;font-size:28px;font-weight:900;color:#fff;">${escapeHtml(merchant.businessName)}</h1>
      <p style="margin:0;color:#aaa;font-size:14px;">${escapeHtml(merchant.sector)} · ${escapeHtml(merchant.city)}</p>
    </div>

    <!-- Description -->
    <div style="background:#14141d;border:1px solid #2a2a3a;border-radius:14px;padding:20px;margin-bottom:20px;">
      <p style="margin:0;color:#ddd;font-size:14px;line-height:1.6;">${escapeHtml(description)}</p>
    </div>

    <!-- Preview -->
    <div style="background:#14141d;border:1px solid #2a2a3a;border-radius:14px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 12px;color:#888;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Aperçu visuel auto-généré</p>
      <img src="${previewSquare}" alt="Visuel marketing ${escapeHtml(merchant.businessName)}" width="600" style="display:block;width:100%;max-width:600px;border-radius:12px;" />
    </div>

    <!-- Caption -->
    <div style="background:#14141d;border:1px solid #2a2a3a;border-radius:14px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 12px;color:#888;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Caption à utiliser</p>
      <pre style="margin:0;color:#ddd;font-size:13px;line-height:1.7;white-space:pre-wrap;font-family:inherit;">${escapeHtml(caption)}</pre>
    </div>

    <!-- Priority -->
    <div style="background:rgba(0,240,212,.08);border:1px solid rgba(0,240,212,.3);border-radius:14px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;color:#00f0d4;font-size:13px;font-weight:600;">📣 Stratégie publication</p>
      <p style="margin:6px 0 0;color:#ddd;font-size:13px;">${escapeHtml(priority)}</p>
    </div>

    <!-- Actions -->
    <div style="display:block;text-align:center;margin-bottom:24px;">
      <a href="${previewSquare}" target="_blank" style="display:inline-block;background:#fff;color:#000;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin:4px;">⬇ Télécharger Post 1:1</a>
      <a href="${previewStory}" target="_blank" style="display:inline-block;background:rgba(255,255,255,.1);color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;border:1px solid rgba(255,255,255,.2);margin:4px;">📱 Format Story</a>
    </div>

    <!-- Footer -->
    <p style="margin:24px 0 0;color:#666;font-size:11px;text-align:center;line-height:1.5;">
      Merchant ID : <code style="color:#888;">${escapeHtml(merchantId)}</code><br/>
      BookEasy Marketing Pipeline · ${new Date().toLocaleDateString("fr-FR")}
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
