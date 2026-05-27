/**
 * BookEasy — Script d'envoi outreach batch (Resend)
 *
 * Usage:
 *   tsx scripts/send-outreach-batch.ts --batch=01 --dry-run
 *   tsx scripts/send-outreach-batch.ts --batch=01 --send
 *
 * Lit `marketing/prospects/batch-XX/batch-XX.csv` et envoie un email
 * personnalisé via Resend pour chaque prospect, avec tagging pour le
 * tracking ouverture (Resend webhook → DB).
 *
 * IMPORTANT: utiliser un sous-domaine outbound dédié (ex. team.bookeasy.me)
 * pour ne PAS dégrader la réputation DKIM de noreply@bookeasy.me utilisé
 * pour les emails transactionnels.
 *
 * Variables d'env requises:
 *   RESEND_API_KEY        — clé API Resend
 *   OUTREACH_FROM         — ex. "Maravai · BookEasy <maravai@team.bookeasy.me>"
 *   OUTREACH_REPLY_TO     — ex. "bookeasy.pf@gmail.com"
 *   OUTREACH_DRY_RUN      — "true" pour dry-run forcé (sécurité)
 */

import { Resend } from "resend";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

type Prospect = {
  id: string;
  prospect_name: string;
  sector: string;
  city: string;
  island: string;
  email: string;
  phone: string;
  instagram: string;
  template_to_use: string;
  personalization_hook: string;
  priority: string;
};

const SECTOR_GREETING: Record<string, string> = {
  tatoueur: "Hello",
  barber: "Hello",
  coiffeur: "Bonjour",
  onglerie: "Hello",
  maquilleuse: "Hello",
  spa: "Bonjour",
  institut_beaute: "Bonjour",
  coach_sportif: "Hello",
  osteopathe: "Bonjour Docteur",
  kine: "Bonjour",
  sage_femme: "Bonjour",
  podologue: "Bonjour",
  infirmier: "Bonjour",
  dentiste: "Bonjour Docteur",
  medecin_generaliste: "Bonjour Docteur",
  photographe: "Hello",
};

const SECTOR_SUBJECT: Record<string, (name: string) => string> = {
  tatoueur: (n) => `${n}, fini les RDV fantômes ?`,
  barber: (n) => `${n}, fini les no-shows ?`,
  coiffeur: (n) => `${n}, vos clientes annulent à la dernière minute ?`,
  onglerie: (n) => `${n}, vos no-shows coûtent combien par mois ?`,
  maquilleuse: (n) => `${n}, sécuriser tes shoots avec un acompte ?`,
  spa: (n) => `Booking en ligne 24/7 pour ${n}`,
  institut_beaute: (n) => `Booking + fidélité pour ${n}`,
  coach_sportif: (n) => `${n}, suivi paiement séances facilité`,
  osteopathe: (n) => `Vos no-shows coûtent combien par mois ?`,
  kine: (n) => `Tournée + rappels SMS pour les kinés PF`,
  sage_femme: (n) => `Booking suivi grossesse pour ${n}`,
  podologue: (n) => `Calendrier annuel automatique pour vos patients`,
  infirmier: (n) => `Tournée optimisée + facturation CPS auto`,
  dentiste: (n) => `Combien Doctolib vous coûte vraiment ?`,
  medecin_generaliste: (n) => `Alternative locale à Doctolib`,
  photographe: (n) => `Vos clients US bookent comment depuis Hawaii ?`,
};

function parseCsv(filePath: string): Prospect[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === "," && !inQuotes) {
        fields.push(current);
        current = "";
      } else current += char;
    }
    fields.push(current);

    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h.trim()] = (fields[i] ?? "").trim()));
    return row as unknown as Prospect;
  });
}

function buildEmail(p: Prospect): { subject: string; html: string; text: string } {
  const greeting = SECTOR_GREETING[p.sector] ?? "Bonjour";
  const subjectFn = SECTOR_SUBJECT[p.sector] ?? ((n: string) => `BookEasy pour ${n}`);
  const subject = subjectFn(p.prospect_name);

  const text = `${greeting} ${p.prospect_name},

J'ai vu ${p.personalization_hook} — je voulais vous écrire perso
plutôt qu'un truc générique.

Je m'appelle Maravai, je suis le fondateur de BookEasy — la plateforme
de réservation en ligne 100% Polynésie française. Forfait fixe XPF,
PayZen natif, support local FR/tahitien.

Une question rapide : combien de no-shows ou créneaux perdus
avez-vous par semaine ? Si c'est plus de 2, BookEasy peut vous
faire récupérer 50 000 à 80 000 XPF par mois.

10-15 min de démo cette semaine ? Je peux passer en vrai
(Papeete) ou en visio.

Tarifs détaillés : https://bookeasy.me/pricing
ROI calculateur : https://bookeasy.me/pricing#calculator

Bien à vous,
Maravai Parau
BookEasy
WhatsApp : +689 XX XX XX XX
bookeasy.pf@gmail.com
`;

  const html = text
    .split("\n\n")
    .map((paragraph) => `<p style="margin: 0 0 16px; line-height: 1.6;">${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");

  return { subject, html, text };
}

async function main() {
  const { values } = parseArgs({
    options: {
      batch: { type: "string", default: "01" },
      "dry-run": { type: "boolean", default: false },
      send: { type: "boolean", default: false },
      limit: { type: "string" },
    },
  });

  const batchId = values.batch as string;
  const dryRun = !values.send || values["dry-run"] === true || process.env.OUTREACH_DRY_RUN === "true";

  const csvPath = path.join(
    process.cwd(),
    "marketing/prospects/batch-" + batchId,
    `batch-${batchId}.csv`,
  );

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Fichier introuvable : ${csvPath}`);
    process.exit(1);
  }

  const prospects = parseCsv(csvPath);
  const limit = values.limit ? parseInt(values.limit, 10) : prospects.length;
  const toSend = prospects.slice(0, limit);

  console.log(`\n📨 BookEasy Outreach — Batch #${batchId}`);
  console.log(`   Mode      : ${dryRun ? "🔍 DRY-RUN (aucun envoi)" : "🚀 ENVOI RÉEL"}`);
  console.log(`   Prospects : ${toSend.length} / ${prospects.length}`);
  console.log(`   From      : ${process.env.OUTREACH_FROM ?? "[OUTREACH_FROM non set]"}`);
  console.log(`   Reply-To  : ${process.env.OUTREACH_REPLY_TO ?? "bookeasy.pf@gmail.com"}\n`);

  if (!dryRun && !process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY manquant. Aborté.");
    process.exit(1);
  }

  if (!dryRun && !process.env.OUTREACH_FROM) {
    console.error("❌ OUTREACH_FROM manquant. Configure un sous-domaine outbound (ex. team.bookeasy.me).");
    process.exit(1);
  }

  const resend = !dryRun && process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const logPath = path.join(
    process.cwd(),
    "marketing/prospects/batch-" + batchId,
    "sent-log.csv",
  );

  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, "timestamp,prospect_id,email,status,resend_id,error\n");
  }

  let sent = 0;
  let failed = 0;

  for (const p of toSend) {
    const { subject, html, text } = buildEmail(p);

    if (dryRun) {
      console.log(`  [DRY] ${p.id} → ${p.email}`);
      console.log(`        Subject: ${subject}`);
      console.log(`        Hook:    ${p.personalization_hook}\n`);
      continue;
    }

    try {
      const result = await resend!.emails.send({
        from: process.env.OUTREACH_FROM!,
        to: p.email,
        replyTo: process.env.OUTREACH_REPLY_TO ?? "bookeasy.pf@gmail.com",
        subject,
        html,
        text,
        tags: [
          { name: "campaign", value: `outreach-batch-${batchId}` },
          { name: "prospect_id", value: p.id },
          { name: "sector", value: p.sector },
          { name: "priority", value: p.priority },
        ],
      });

      const resendId = result.data?.id ?? "unknown";
      fs.appendFileSync(
        logPath,
        `${new Date().toISOString()},${p.id},${p.email},sent,${resendId},\n`,
      );
      console.log(`  ✓ ${p.id} → ${p.email} (${resendId})`);
      sent++;

      // Throttle to 2 emails/sec — Resend free tier limit
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      fs.appendFileSync(
        logPath,
        `${new Date().toISOString()},${p.id},${p.email},failed,,${errMsg.replace(/,/g, ";")}\n`,
      );
      console.error(`  ✗ ${p.id} → ${p.email} | ${errMsg}`);
      failed++;
    }
  }

  console.log(`\n📊 Résumé batch #${batchId}`);
  console.log(`   Envoyés : ${sent}`);
  console.log(`   Échoués : ${failed}`);
  console.log(`   Log     : ${logPath}\n`);

  if (dryRun) {
    console.log("💡 Pour envoyer réellement : tsx scripts/send-outreach-batch.ts --batch=01 --send");
  }
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err);
  process.exit(1);
});
