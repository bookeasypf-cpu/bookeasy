import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const VERSION = "v1";

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env.PATIENT_NOTES_ENC_KEY;
  if (!raw) {
    throw new Error(
      "PATIENT_NOTES_ENC_KEY missing — generate with: openssl rand -base64 32"
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      `PATIENT_NOTES_ENC_KEY must decode to 32 bytes (got ${key.length})`
    );
  }
  cachedKey = key;
  return key;
}

function isEncrypted(value: string): boolean {
  return value.startsWith(`${VERSION}:`);
}

export function encryptPatientNote(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

export function decryptPatientNote(stored: string): string {
  // Legacy plaintext rows: return as-is so existing notes remain readable
  // until they're rewritten through POST (which always encrypts).
  if (!isEncrypted(stored)) return stored;

  const [, ivB64, authTagB64, ctB64] = stored.split(":");
  if (!ivB64 || !authTagB64 || !ctB64) {
    throw new Error("Malformed encrypted patient note");
  }
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid auth tag length");
  }
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
