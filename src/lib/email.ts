import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Guard: refuse to send to any address that has hard-bounced or complained
 * (set by the Resend webhook). Without this guard, the system keeps emailing
 * dead addresses on every cron + every booking, dragging the bounce rate up
 * until Resend suspends the account at 5%.
 *
 * Fail-open if the DB query throws — never block transactional emails on
 * an infrastructure hiccup.
 */
async function canSendTo(email: string): Promise<boolean> {
  try {
    const blocked = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        OR: [{ emailBounced: true }, { emailComplained: true }],
      },
      select: { id: true },
    });
    return !blocked;
  } catch {
    return true;
  }
}

// IMPORTANT: the domain in EMAIL_FROM must be verified in Resend Dashboard
// (DKIM + SPF + DMARC). The fallback below matches the canonical production
// domain (bookeasy.me). Update both here and in .env.example if it changes.
const FROM = process.env.EMAIL_FROM || "BookEasy <noreply@bookeasy.me>";
const BASE_URL = process.env.NEXTAUTH_URL || "https://bookeasy.me";
const REPLY_TO = process.env.SUPPORT_EMAIL || "bookeasy.pf@gmail.com";

/**
 * Escape HTML to prevent XSS injection via user-controlled fields
 * (clientName, merchantName, serviceName, message, subject, etc.)
 * MUST be applied to every interpolated user value in email templates.
 */
function esc(s: string | null | undefined): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─────────────────────────────────────────────
// SHARED LAYOUT
// ─────────────────────────────────────────────

function layout(content: string) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:24px;font-weight:800;color:#0C1B2A;">Book</span><span style="font-size:24px;font-weight:800;color:#0066FF;">Easy</span>
    </div>
    <!-- Card -->
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;color:#9ca3af;font-size:12px;">
      <p style="margin:0;">BookEasy &mdash; Réservation en ligne en Polynésie française</p>
      <p style="margin:4px 0 0;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// BOOKING CONFIRMATION (sent to client)
// ─────────────────────────────────────────────

interface BookingConfirmationData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  merchantName: string;
  date: string; // "2026-03-15"
  startTime: string; // "14:00"
  endTime: string;
  price: number;
  address?: string | null;
  city?: string | null;
}

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured – skipping booking confirmation");
    return;
  }
  if (!(await canSendTo(data.clientEmail))) {
    console.log("[EMAIL] Skipped confirmation — recipient bounced or complained");
    return;
  }

  const dateFormatted = new Date(data.date + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Escape each part — address/city are merchant-controlled, must not inject HTML.
  const location = [data.address, data.city]
    .filter((s): s is string => Boolean(s))
    .map(esc)
    .join(", ");
  const priceFormatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(data.price) + " F";

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0066FF,#00B4D8);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">✅</div>
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Réservation confirmée !</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:8px 0 0;">Votre rendez-vous est bien enregistré</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Bonjour <strong>${esc(data.clientName)}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Voici le récapitulatif de votre rendez-vous :</p>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#9ca3af;width:110px;">Service</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${esc(data.serviceName)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#9ca3af;">Chez</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${esc(data.merchantName)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#9ca3af;">Date</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${dateFormatted}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#9ca3af;">Horaire</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${data.startTime.replace(":", "h")} – ${data.endTime.replace(":", "h")}</td>
          </tr>
          ${location ? `<tr>
            <td style="padding:8px 0;color:#9ca3af;">Adresse</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${location}</td>
          </tr>` : ""}
          <tr>
            <td style="padding:8px 0;color:#9ca3af;">Prix</td>
            <td style="padding:8px 0;color:#0066FF;font-weight:700;font-size:16px;">${priceFormatted}</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;margin-top:8px;">
        <a href="${BASE_URL}/my-bookings" style="display:inline-block;background:linear-gradient(135deg,#0066FF,#00B4D8);color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">Voir mes rendez-vous</a>
      </div>
      <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;text-align:center;">Vous pouvez gérer vos rendez-vous depuis votre espace BookEasy.</p>
    </div>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: data.clientEmail,
      subject: `✅ RDV confirmé – ${esc(data.serviceName)} chez ${esc(data.merchantName)}`,
      html,
    });
    console.log("[EMAIL] Confirmation sent");
  } catch (err) {
    console.error("[EMAIL] Failed to send confirmation:", err);
  }
}

// ─────────────────────────────────────────────
// BOOKING REMINDER (24h before, sent to client)
// ─────────────────────────────────────────────

interface ReminderData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  merchantName: string;
  date: string;
  startTime: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
}

export async function sendBookingReminder(data: ReminderData) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured – skipping reminder");
    return;
  }
  if (!(await canSendTo(data.clientEmail))) {
    console.log("[EMAIL] Skipped reminder — recipient bounced or complained");
    return;
  }

  const dateFormatted = new Date(data.date + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Escape each part — merchant-controlled values must not inject HTML.
  const location = [data.address, data.city]
    .filter((s): s is string => Boolean(s))
    .map(esc)
    .join(", ");

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0C1B2A,#132D46);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">⏰</div>
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Rappel : RDV demain !</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:8px 0 0;">N'oubliez pas votre rendez-vous</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Bonjour <strong>${esc(data.clientName)}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Nous vous rappelons que vous avez un rendez-vous demain :</p>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#9ca3af;width:110px;">Service</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${esc(data.serviceName)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#9ca3af;">Chez</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${esc(data.merchantName)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#9ca3af;">Date</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${dateFormatted}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#9ca3af;">Heure</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:700;font-size:16px;">${data.startTime.replace(":", "h")}</td>
          </tr>
          ${location ? `<tr>
            <td style="padding:8px 0;color:#9ca3af;">Adresse</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${location}</td>
          </tr>` : ""}
          ${data.phone ? `<tr>
            <td style="padding:8px 0;color:#9ca3af;">Téléphone</td>
            <td style="padding:8px 0;color:#0066FF;font-weight:600;">${esc(data.phone)}</td>
          </tr>` : ""}
        </table>
      </div>
      <div style="text-align:center;margin-top:8px;">
        <a href="${BASE_URL}/my-bookings" style="display:inline-block;background:linear-gradient(135deg,#0C1B2A,#132D46);color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">Voir mes rendez-vous</a>
      </div>
      <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;text-align:center;">Si vous devez annuler, rendez-vous dans votre espace BookEasy.</p>
    </div>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: data.clientEmail,
      subject: `⏰ Rappel : ${esc(data.serviceName)} demain à ${data.startTime.replace(":", "h")}`,
      html,
    });
    console.log("[EMAIL] Reminder sent");
  } catch (err) {
    console.error("[EMAIL] Failed to send reminder:", err);
  }
}

// ─────────────────────────────────────────────
// BOOKING CANCELLED (sent to client or merchant)
// ─────────────────────────────────────────────

interface CancellationData {
  recipientName: string;
  recipientEmail: string;
  serviceName: string;
  otherPartyName: string;
  date: string;
  startTime: string;
  cancelledBy: "client" | "merchant";
  reason?: string | null;
}

export async function sendBookingCancellation(data: CancellationData) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured – skipping cancellation");
    return;
  }
  if (!(await canSendTo(data.recipientEmail))) {
    console.log("[EMAIL] Skipped cancellation — recipient bounced or complained");
    return;
  }

  const dateFormatted = new Date(data.date + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const html = layout(`
    <div style="background:#fee2e2;padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">❌</div>
      <h1 style="color:#991b1b;font-size:22px;margin:0;font-weight:700;">Rendez-vous annulé</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Bonjour <strong>${esc(data.recipientName)}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
        ${data.cancelledBy === "client"
          ? `<strong>${esc(data.otherPartyName)}</strong> a annulé son rendez-vous.`
          : `<strong>${esc(data.otherPartyName)}</strong> a dû annuler votre rendez-vous.`}
      </p>
      <div style="background:#fef2f2;border-radius:12px;padding:16px;margin-bottom:20px;border:1px solid #fecaca;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:6px 0;color:#9ca3af;width:100px;">Service</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${esc(data.serviceName)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Date</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${dateFormatted} à ${data.startTime.replace(":", "h")}</td>
          </tr>
          ${data.reason ? `<tr>
            <td style="padding:6px 0;color:#9ca3af;">Raison</td>
            <td style="padding:6px 0;color:#6b7280;">${esc(data.reason)}</td>
          </tr>` : ""}
        </table>
      </div>
      <div style="text-align:center;margin-top:8px;">
        <a href="${BASE_URL}/my-bookings" style="display:inline-block;background:#0066FF;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">Prendre un nouveau rendez-vous</a>
      </div>
    </div>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: data.recipientEmail,
      subject: `❌ RDV annulé – ${esc(data.serviceName)} le ${dateFormatted}`,
      html,
    });
    console.log("[EMAIL] Cancellation sent");
  } catch (err) {
    console.error("[EMAIL] Failed to send cancellation:", err);
  }
}

// ─────────────────────────────────────────────
// WELCOME EMAIL (after registration)
// ─────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured – skipping welcome email");
    return;
  }
  if (!(await canSendTo(to))) {
    console.log("[EMAIL] Skipped welcome — recipient bounced or complained");
    return;
  }

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0066FF,#00B4D8);padding:40px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h1 style="color:#fff;font-size:24px;margin:0;font-weight:700;">Bienvenue sur BookEasy !</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:10px 0 0;">Votre compte a été créé avec succès</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Ia ora na <strong>${esc(name)}</strong> 👋</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
        Merci de nous rejoindre ! Avec BookEasy, réservez vos rendez-vous en quelques clics auprès des meilleurs professionnels de Polynésie française.
      </p>
      <div style="background:#f0f7ff;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 12px;color:#0C1B2A;font-weight:600;font-size:14px;">Ce que vous pouvez faire :</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:6px 0;color:#0066FF;width:28px;vertical-align:top;font-size:16px;">📅</td>
            <td style="padding:6px 0;color:#374151;">Réserver un rendez-vous en ligne, 24h/24</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#0066FF;width:28px;vertical-align:top;font-size:16px;">🔔</td>
            <td style="padding:6px 0;color:#374151;">Recevoir des rappels avant vos rendez-vous</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#0066FF;width:28px;vertical-align:top;font-size:16px;">⭐</td>
            <td style="padding:6px 0;color:#374151;">Gagner des points XP à chaque réservation</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#0066FF;width:28px;vertical-align:top;font-size:16px;">🎁</td>
            <td style="padding:6px 0;color:#374151;">Offrir des cartes cadeaux à vos proches</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;margin-top:8px;">
        <a href="${BASE_URL}/search" style="display:inline-block;background:linear-gradient(135deg,#0066FF,#00B4D8);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;">Découvrir les professionnels</a>
      </div>
      <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;text-align:center;">À très bientôt sur BookEasy !</p>
    </div>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to,
      subject: "🎉 Bienvenue sur BookEasy !",
      html,
      headers: {
        "List-Unsubscribe": `<mailto:${REPLY_TO}?subject=Unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    console.log("[EMAIL] Welcome email sent");
  } catch (err) {
    console.error("[EMAIL] Failed to send welcome email:", err);
  }
}

// ─────────────────────────────────────────────
// MERCHANT CREDENTIALS (quick-register)
// ─────────────────────────────────────────────

export async function sendMerchantCredentials(to: string, name: string, tempPassword: string) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured – skipping credentials email");
    return;
  }
  if (!(await canSendTo(to))) {
    console.log("[EMAIL] Skipped credentials — recipient bounced or complained");
    return;
  }

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0066FF,#00B4D8);padding:40px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">🔐</div>
      <h1 style="color:#fff;font-size:24px;margin:0;font-weight:700;">Votre compte professionnel</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:10px 0 0;">Vos identifiants de connexion</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Ia ora na <strong>${esc(name)}</strong> 👋</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
        Votre compte professionnel BookEasy a été créé. Voici vos identifiants de connexion :
      </p>
      <div style="background:#f0f7ff;border-radius:12px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#9ca3af;width:120px;">Email</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${esc(to)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#9ca3af;">Mot de passe</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:700;font-family:monospace;font-size:16px;letter-spacing:1px;">${esc(tempPassword)}</td>
          </tr>
        </table>
      </div>
      <div style="background:#fef3c7;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
          ⚠️ <strong>Changez votre mot de passe</strong> dès votre première connexion pour sécuriser votre compte.
        </p>
      </div>
      <div style="text-align:center;margin-top:8px;">
        <a href="${BASE_URL}/login" style="display:inline-block;background:linear-gradient(135deg,#0066FF,#00B4D8);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;">Se connecter</a>
      </div>
    </div>
  `);

  try {
    const result = await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to,
      subject: "🎉 Bienvenue sur BookEasy Pro — vos identifiants",
      html,
    });
    console.log("[EMAIL] Merchant welcome+credentials sent:", JSON.stringify({ to, id: result.data?.id, error: result.error?.message }));
  } catch (err) {
    console.error("[EMAIL] Failed to send credentials:", err instanceof Error ? err.message : err);
  }
}

// ─────────────────────────────────────────────
// REFERRAL REWARD (sent to referrer)
// ─────────────────────────────────────────────

export async function sendReferralRewardEmail(
  to: string,
  name: string,
  xpEarned: number,
  reason: string
) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured – skipping referral reward");
    return;
  }
  if (!(await canSendTo(to))) {
    console.log("[EMAIL] Skipped referral reward — recipient bounced or complained");
    return;
  }

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0066FF,#00B4D8);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">🎁</div>
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Vous avez gagné ${xpEarned} XP !</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Grâce à votre parrainage</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Bonjour <strong>${esc(name)}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
        ${esc(reason)}. Vous avez reçu <strong style="color:#0066FF;">${xpEarned} XP</strong> en récompense !
      </p>
      <div style="background:#f0f7ff;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center;">
        <div style="font-size:36px;font-weight:800;color:#0066FF;">+${xpEarned} XP</div>
        <p style="margin:8px 0 0;color:#6b7280;font-size:13px;">ajoutés à votre solde</p>
      </div>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
        Continuez à inviter vos amis pour gagner encore plus de XP et débloquer des récompenses exclusives !
      </p>
      <div style="text-align:center;margin-top:8px;">
        <a href="${BASE_URL}/referrals" style="display:inline-block;background:linear-gradient(135deg,#0066FF,#00B4D8);color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">Voir mon parrainage</a>
      </div>
    </div>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to,
      subject: `🎁 +${xpEarned} XP – Parrainage BookEasy`,
      html,
      headers: {
        "List-Unsubscribe": `<mailto:${REPLY_TO}?subject=Unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    console.log("[EMAIL] Referral reward email sent");
  } catch (err) {
    console.error("[EMAIL] Failed to send referral reward:", err);
  }
}

// ─────────────────────────────────────────────
// PASSWORD RESET
// ─────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured – skipping password reset");
    return;
  }
  if (!(await canSendTo(to))) {
    console.log("[EMAIL] Skipped password reset — recipient bounced or complained");
    return;
  }

  const resetLink = `${BASE_URL}/reset-password?token=${token}`;

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0C1B2A,#132D46);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">🔐</div>
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Réinitialisation du mot de passe</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Bonjour <strong>${esc(name)}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
        Vous avez demandé la réinitialisation de votre mot de passe BookEasy.
        Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#0066FF,#00B4D8);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;">Réinitialiser mon mot de passe</a>
      </div>
      <div style="background:#fef3c7;border-radius:12px;padding:16px;margin-bottom:16px;">
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
          ⚠️ Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </p>
      </div>
      <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
        Si le bouton ne fonctionne pas, copiez ce lien :<br/>
        <a href="${resetLink}" style="color:#0066FF;word-break:break-all;">${resetLink}</a>
      </p>
    </div>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to,
      subject: "🔐 Réinitialisation de votre mot de passe BookEasy",
      html,
    });
    console.log("[EMAIL] Password reset email sent");
  } catch (err) {
    console.error("[EMAIL] Failed to send password reset:", err);
  }
}

// ─────────────────────────────────────────────
// SUPPORT MESSAGE (from Pro merchant)
// ─────────────────────────────────────────────

interface SupportData {
  merchantName: string;
  merchantEmail: string;
  merchantPlan: string;
  subject: string;
  message: string;
}

export async function sendSupportMessage(data: SupportData) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured – skipping support message");
    return { success: false, error: "Email non configuré" };
  }

  const priority = data.merchantPlan === "PRO" ? "🔴 [PRO - PRIORITAIRE]" : "⚪ [GRATUIT]";

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0C1B2A,#132D46);padding:24px;text-align:center;">
      <h1 style="color:#fff;font-size:20px;margin:0;font-weight:700;">${priority} Demande de support</h1>
    </div>
    <div style="padding:24px;">
      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:16px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:6px 0;color:#9ca3af;width:100px;">Commerce</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${esc(data.merchantName)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Email</td>
            <td style="padding:6px 0;color:#0066FF;font-weight:600;">${esc(data.merchantEmail)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Plan</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${esc(data.merchantPlan)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Sujet</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${esc(data.subject)}</td>
          </tr>
        </table>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;">
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(data.message)}</p>
      </div>
    </div>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      to: process.env.SUPPORT_EMAIL || "bookeasy.pf@gmail.com",
      replyTo: data.merchantEmail,
      subject: `${priority} ${esc(data.subject)} — ${esc(data.merchantName)}`,
      html,
    });
    console.log("[EMAIL] Support message sent");
    return { success: true };
  } catch (err) {
    console.error("[EMAIL] Failed to send support message:", err);
    return { success: false, error: "Erreur d'envoi" };
  }
}

// ─────────────────────────────────────────────
// NEW BOOKING — sent to MERCHANT (in addition to push/in-app)
// ─────────────────────────────────────────────

interface NewBookingMerchantData {
  merchantEmail: string;
  merchantName: string;
  clientName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

export async function sendNewBookingMerchant(data: NewBookingMerchantData) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured – skipping merchant new-booking");
    return;
  }
  if (!(await canSendTo(data.merchantEmail))) {
    console.log("[EMAIL] Skipped merchant new-booking — recipient bounced or complained");
    return;
  }

  const dateFormatted = new Date(data.date).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const priceFormatted = data.price.toLocaleString("fr-FR") + " F CFP";

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0066FF,#00B4D8);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">📅</div>
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Nouveau rendez-vous</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:6px 0 0;">${esc(data.clientName)} vient de réserver</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Bonjour <strong>${esc(data.merchantName)}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
        Une nouvelle réservation a été confirmée :
      </p>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:6px 0;color:#9ca3af;width:100px;">Client</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${esc(data.clientName)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Service</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${esc(data.serviceName)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Date</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${dateFormatted}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Horaire</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:700;">${data.startTime.replace(":", "h")} – ${data.endTime.replace(":", "h")}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Prix</td>
            <td style="padding:6px 0;color:#0066FF;font-weight:700;">${priceFormatted}</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;margin-top:8px;">
        <a href="${BASE_URL}/dashboard/bookings" style="display:inline-block;background:linear-gradient(135deg,#0066FF,#00B4D8);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;">Voir mes réservations</a>
      </div>
    </div>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: data.merchantEmail,
      subject: `📅 Nouveau RDV — ${esc(data.serviceName)} le ${dateFormatted}`,
      html,
    });
    console.log("[EMAIL] New booking notification sent to merchant");
  } catch (err) {
    console.error("[EMAIL] Failed to send merchant new-booking:", err);
  }
}

// ─────────────────────────────────────────────
// GIFT CARD (delivered after PayZen confirmation)
// ─────────────────────────────────────────────

interface GiftCardEmailData {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  code: string;
  amountXPF: number;
  message?: string | null;
  expiresAt: Date;
  merchantName?: string | null;
}

export async function sendGiftCardEmail(data: GiftCardEmailData) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured – skipping gift card");
    return;
  }
  if (!(await canSendTo(data.recipientEmail))) {
    console.log("[EMAIL] Skipped gift card — recipient bounced or complained");
    return;
  }

  const expiresFormatted = data.expiresAt.toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
  const amountFormatted = data.amountXPF.toLocaleString("fr-FR") + " F CFP";

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0066FF,#00B4D8);padding:40px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">🎁</div>
      <h1 style="color:#fff;font-size:24px;margin:0;font-weight:700;">${esc(data.senderName)} vous offre une carte cadeau !</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:10px 0 0;">${amountFormatted} à utiliser sur BookEasy</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Bonjour <strong>${esc(data.recipientName)}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
        ${esc(data.senderName)} vous a offert une carte cadeau d&apos;une valeur de <strong>${amountFormatted}</strong>${data.merchantName ? ` à utiliser chez <strong>${esc(data.merchantName)}</strong>` : " à utiliser chez tous les partenaires BookEasy"}.
      </p>
      ${data.message ? `<div style="background:#f0f7ff;border-radius:12px;padding:16px;margin-bottom:20px;border-left:3px solid #0066FF;">
        <p style="margin:0;color:#374151;font-size:13px;font-style:italic;">"${esc(data.message)}"</p>
      </div>` : ""}
      <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center;">
        <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">Code de la carte</p>
        <p style="margin:0;color:#0066FF;font-size:24px;font-weight:700;font-family:monospace;letter-spacing:3px;">${esc(data.code)}</p>
        <p style="margin:12px 0 0;color:#9ca3af;font-size:11px;">Valable jusqu&apos;au ${expiresFormatted}</p>
      </div>
      <div style="text-align:center;margin-top:8px;">
        <a href="${BASE_URL}/search" style="display:inline-block;background:linear-gradient(135deg,#0066FF,#00B4D8);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;">Utiliser ma carte cadeau</a>
      </div>
      <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;text-align:center;">Présentez le code lors de votre réservation.</p>
    </div>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      to: data.recipientEmail,
      replyTo: REPLY_TO,
      subject: `🎁 ${data.senderName} vous offre une carte cadeau BookEasy`,
      html,
    });
    console.log("[EMAIL] Gift card sent");
  } catch (err) {
    console.error("[EMAIL] Failed to send gift card:", err);
  }
}
