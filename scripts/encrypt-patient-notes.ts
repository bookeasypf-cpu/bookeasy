/**
 * BookEasy — Migration one-shot des notes patients en clair → chiffrées
 *
 * Usage:
 *   tsx scripts/encrypt-patient-notes.ts --dry-run
 *   tsx scripts/encrypt-patient-notes.ts --apply
 *
 * Lit toutes les PatientNote dont le content ne commence pas par "v1:"
 * (= legacy plaintext) et les ré-écrit chiffrées via la lib partagée.
 * Idempotent : relancer le script ne touche pas aux notes déjà chiffrées.
 *
 * Pré-requis : PATIENT_NOTES_ENC_KEY défini dans l'env (32 bytes base64).
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { parseArgs } from "node:util";
import { encryptPatientNote } from "../src/lib/patient-notes-crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const { values } = parseArgs({
    options: {
      "dry-run": { type: "boolean", default: false },
      apply: { type: "boolean", default: false },
    },
  });

  const dryRun = values["dry-run"] || !values.apply;

  if (!process.env.PATIENT_NOTES_ENC_KEY) {
    console.error("✗ PATIENT_NOTES_ENC_KEY missing in env");
    process.exit(1);
  }

  // Fetch all rows whose content is NOT already prefixed with "v1:"
  const legacy = await prisma.patientNote.findMany({
    where: { content: { not: { startsWith: "v1:" } } },
    select: { id: true, content: true },
  });

  console.log(`Found ${legacy.length} plaintext patient note(s).`);
  if (legacy.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  if (dryRun) {
    console.log("Dry-run — no writes. Re-run with --apply to encrypt.");
    return;
  }

  let migrated = 0;
  let failed = 0;
  for (const row of legacy) {
    try {
      const encrypted = encryptPatientNote(row.content);
      await prisma.patientNote.update({
        where: { id: row.id },
        data: { content: encrypted },
      });
      migrated++;
    } catch (err) {
      failed++;
      console.error(`✗ ${row.id}:`, (err as Error).message);
    }
  }

  console.log(`✓ Encrypted ${migrated} note(s). Failed: ${failed}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
