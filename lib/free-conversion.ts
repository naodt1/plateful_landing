/**
 * Tracks the single free web conversion per account, in Firestore under
 * `web_conversions/{uid}`.
 *
 * Rules make that collection create-once for its owner (no update, no delete),
 * so once a slot is claimed the user cannot clear it from the client. Claiming
 * uses Firestore's `documentId` create, which fails with 409 if the doc already
 * exists, giving an atomic guard against firing several requests at once.
 */

const BASE = "https://firestore.googleapis.com/v1";

function docPath(uid: string): string {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return `${BASE}/projects/${projectId}/databases/(default)/documents/web_conversions/${uid}`;
}

function collectionPath(uid: string): string {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return `${BASE}/projects/${projectId}/databases/(default)/documents/web_conversions?documentId=${uid}`;
}

/** True when this account has already spent its free conversion. */
export async function hasUsedFreeConversion(
  uid: string,
  idToken: string
): Promise<boolean> {
  const response = await fetch(docPath(uid), {
    headers: { Authorization: `Bearer ${idToken}` },
    cache: "no-store",
  });

  if (response.status === 404) return false;
  if (response.ok) return true;

  throw new Error(`Could not check conversion history (${response.status}).`);
}

/**
 * Claims the free conversion. Returns false when it was already claimed, so
 * the caller can stop before spending anything on AI.
 */
export async function claimFreeConversion(
  uid: string,
  idToken: string,
  sourceUrl: string,
  diet: string
): Promise<boolean> {
  const response = await fetch(collectionPath(uid), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        used_at: { timestampValue: new Date().toISOString() },
        source_url: { stringValue: sourceUrl.slice(0, 1500) },
        diet: { stringValue: diet },
        source: { stringValue: "landing_page" },
      },
    }),
  });

  if (response.ok) return true;
  if (response.status === 409) return false; // already claimed

  throw new Error(`Could not record the conversion (${response.status}).`);
}
