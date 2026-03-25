import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "BookEasy <noreply@bookeasy.me>";
const BASE_URL = process.env.NEXTAUTH_URL || "https://bookeasy.me";

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
    console.log("[EMAIL] Resend not configured – skipping booking confirmation to", data.clientEmail);
    return;
  }

  const dateFormatted = new Date(data.date + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const location = [data.address, data.city].filter(Boolean).join(", ");
  const priceFormatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(data.price) + " F";

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0066FF,#00B4D8);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">✅</div>
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Réservation confirmée !</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:8px 0 0;">Votre rendez-vous est bien enregistré</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Bonjour <strong>${data.clientName}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Voici le récapitulatif de votre rendez-vous :</p>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#9ca3af;width:110px;">Service</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#9ca3af;">Chez</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${data.merchantName}</td>
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
      to: data.clientEmail,
      subject: `✅ RDV confirmé – ${data.serviceName} chez ${data.merchantName}`,
      html,
    });
    console.log("[EMAIL] Confirmation sent to", data.clientEmail);
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
    console.log("[EMAIL] Resend not configured – skipping reminder to", data.clientEmail);
    return;
  }

  const dateFormatted = new Date(data.date + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const location = [data.address, data.city].filter(Boolean).join(", ");

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0C1B2A,#132D46);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">⏰</div>
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Rappel : RDV demain !</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:8px 0 0;">N'oubliez pas votre rendez-vous</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Bonjour <strong>${data.clientName}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Nous vous rappelons que vous avez un rendez-vous demain :</p>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#9ca3af;width:110px;">Service</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#9ca3af;">Chez</td>
            <td style="padding:8px 0;color:#0C1B2A;font-weight:600;">${data.merchantName}</td>
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
            <td style="padding:8px 0;color:#0066FF;font-weight:600;">${data.phone}</td>
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
      to: data.clientEmail,
      subject: `⏰ Rappel : ${data.serviceName} demain à ${data.startTime.replace(":", "h")}`,
      html,
    });
    console.log("[EMAIL] Reminder sent to", data.clientEmail);
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
    console.log("[EMAIL] Resend not configured – skipping cancellation to", data.recipientEmail);
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
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Bonjour <strong>${data.recipientName}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
        ${data.cancelledBy === "client"
          ? `<strong>${data.otherPartyName}</strong> a annulé son rendez-vous.`
          : `<strong>${data.otherPartyName}</strong> a dû annuler votre rendez-vous.`}
      </p>
      <div style="background:#fef2f2;border-radius:12px;padding:16px;margin-bottom:20px;border:1px solid #fecaca;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:6px 0;color:#9ca3af;width:100px;">Service</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Date</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${dateFormatted} à ${data.startTime.replace(":", "h")}</td>
          </tr>
          ${data.reason ? `<tr>
            <td style="padding:6px 0;color:#9ca3af;">Raison</td>
            <td style="padding:6px 0;color:#6b7280;">${data.reason}</td>
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
      to: data.recipientEmail,
      subject: `❌ RDV annulé – ${data.serviceName} le ${dateFormatted}`,
      html,
    });
    console.log("[EMAIL] Cancellation sent to", data.recipientEmail);
  } catch (err) {
    console.error("[EMAIL] Failed to send cancellation:", err);
  }
}

// ─────────────────────────────────────────────
// WELCOME EMAIL (after registration)
// ─────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured – skipping welcome email to", to);
    return;
  }

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0066FF,#00B4D8);padding:40px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h1 style="color:#fff;font-size:24px;margin:0;font-weight:700;">Bienvenue sur BookEasy !</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:10px 0 0;">Votre compte a été créé avec succès</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Ia ora na <strong>${name}</strong> 👋</p>
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
      to,
      subject: "🎉 Bienvenue sur BookEasy !",
      html,
    });
    console.log("[EMAIL] Welcome email sent to", to);
  } catch (err) {
    console.error("[EMAIL] Failed to send welcome email:", err);
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
    console.log("[EMAIL] Resend not configured – skipping referral reward to", to);
    return;
  }

  const html = layout(`
    <div style="background:linear-gradient(135deg,#0066FF,#00B4D8);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">🎁</div>
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Vous avez gagné ${xpEarned} XP !</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Grâce à votre parrainage</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#374151;font-size:14px;">Bonjour <strong>${name}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
        ${reason}. Vous avez reçu <strong style="color:#0066FF;">${xpEarned} XP</strong> en récompense !
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
      to,
      subject: `🎁 +${xpEarned} XP – Parrainage BookEasy`,
      html,
    });
    console.log("[EMAIL] Referral reward email sent to", to);
  } catch (err) {
    console.error("[EMAIL] Failed to send referral reward:", err);
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
    console.log("[EMAIL] Resend not configured – skipping support message from", data.merchantEmail);
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
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${data.merchantName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Email</td>
            <td style="padding:6px 0;color:#0066FF;font-weight:600;">${data.merchantEmail}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Plan</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${data.merchantPlan}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9ca3af;">Sujet</td>
            <td style="padding:6px 0;color:#0C1B2A;font-weight:600;">${data.subject}</td>
          </tr>
        </table>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;">
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap;">${data.message}</p>
      </div>
    </div>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      to: process.env.SUPPORT_EMAIL || "contact@bookeasy.me",
      replyTo: data.merchantEmail,
      subject: `${priority} ${data.subject} — ${data.merchantName}`,
      html,
    });
    console.log("[EMAIL] Support message sent from", data.merchantEmail);
    return { success: true };
  } catch (err) {
    console.error("[EMAIL] Failed to send support message:", err);
    return { success: false, error: "Erreur d'envoi" };
  }
}
