import crypto from "node:crypto";

/**
 * Seals a conversion result so the browser can hold it without being able to
 * read it.
 *
 * The recipe is converted before anyone signs in, which means the result has to
 * live somewhere between "done" and "revealed". Keeping it in server memory
 * would break the moment the reveal request lands on a different instance, and
 * handing the plain JSON to the page would make the sign-in step decorative:
 * the answer would already be sitting in the network tab. Encrypting it with a
 * key only the server holds gives a token that survives any instance and still
 * says nothing until the server opens it.
 */

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const TTL_MS = 30 * 60 * 1000;

function key(): Buffer {
  const secret = process.env.PLATEFUL_APP_SECRET;
  if (!secret) throw new Error("PLATEFUL_APP_SECRET is not set");
  return crypto.createHash("sha256").update(secret).digest();
}

export function seal(payload: unknown): string {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key(), iv);
  const body = JSON.stringify({ exp: Date.now() + TTL_MS, payload });
  const encrypted = Buffer.concat([
    cipher.update(body, "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted].map(Buffer.from))
    .toString("base64url");
}

/** Returns null for anything tampered with, malformed, or past its window. */
export function open<T>(token: string): T | null {
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length <= IV_BYTES + TAG_BYTES) return null;

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key(),
      raw.subarray(0, IV_BYTES)
    );
    decipher.setAuthTag(raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));

    const plain = Buffer.concat([
      decipher.update(raw.subarray(IV_BYTES + TAG_BYTES)),
      decipher.final(),
    ]).toString("utf8");

    const parsed = JSON.parse(plain) as { exp?: number; payload?: T };
    if (typeof parsed.exp !== "number" || Date.now() > parsed.exp) return null;
    return (parsed.payload ?? null) as T | null;
  } catch {
    return null;
  }
}
