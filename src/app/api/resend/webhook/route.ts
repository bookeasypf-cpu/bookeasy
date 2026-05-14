import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Resend webhook handler — receives email lifecycle events.
 * Marks users as bounced/complained so we stop sending to invalid
 * addresses (avoids Resend account suspension on >5% bounce rate).
 *
 * Events handled:
 *   - email.bounced     → emailBounced = true (hard bounce only)
 *   - email.complained  → emailComplained = true (spam report)
 *
 * Signature verification uses Svix (Resend's standard) when
 * RESEND_WEBHOOK_SECRET is set.
 */

interface ResendEvent {
  type: string;
  data: {
    email_id?: string;
    to?: string[];
    bounce?: { type?: string };
  };
}

async function verifySvixSignature(
  body: string,
  headers: Headers,
  secret: string
): Promise<boolean> {
  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) return false;

  // Reject events older than 5 minutes (replay protection)
  const ts = parseInt(svixTimestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const signedPayload = `${svixId}.${svixTimestamp}.${body}`;
  const secretBytes = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.from(secret);

  const expected = crypto
    .createHmac("sha256", secretBytes)
    .update(signedPayload)
    .digest("base64");

  // Resend may send multiple signatures separated by spaces (rotation)
  const sigs = svixSignature.split(" ").map((s) => s.split(",")[1]).filter(Boolean);
  return sigs.some((sig) => {
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const secret = process.env.RESEND_WEBHOOK_SECRET;

    // Reject ALL unsigned requests. Without the secret, any attacker
    // could mark users as emailBounced=true and cut their email delivery.
    if (!secret) {
      console.error("[RESEND-WEBHOOK] RESEND_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }
    const valid = await verifySvixSignature(body, req.headers, secret);
    if (!valid) {
      console.error("[RESEND-WEBHOOK] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event: ResendEvent;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const recipient = event.data?.to?.[0]?.toLowerCase();
    if (!recipient) {
      return NextResponse.json({ ok: true });
    }

    // Atomic idempotency via WebhookEvent.id unique constraint.
    // findUnique+create was non-atomic — two concurrent webhook retries could
    // both pass the check and both update emailBounced.
    if (event.data?.email_id) {
      const eventId = `resend-${event.data.email_id}-${event.type}`;
      try {
        await prisma.webhookEvent.create({ data: { id: eventId, source: "resend" } });
      } catch (e) {
        if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
          return NextResponse.json({ ok: true });
        }
        throw e;
      }
    }

    if (event.type === "email.bounced") {
      // Only hard bounces — soft bounces should not block future sends
      const isHard = event.data.bounce?.type === "hard" || event.data.bounce?.type === "Permanent";
      if (isHard) {
        await prisma.user.updateMany({
          where: { email: recipient },
          data: { emailBounced: true, emailLastEvent: new Date() },
        });
      }
    } else if (event.type === "email.complained") {
      await prisma.user.updateMany({
        where: { email: recipient },
        data: { emailComplained: true, emailLastEvent: new Date() },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[RESEND-WEBHOOK] Error:", error);
    // Always 200 to avoid Resend retries (idempotency handles dupes)
    return NextResponse.json({ ok: true });
  }
}
