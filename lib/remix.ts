import crypto from "node:crypto";

/**
 * Shared remixes, stored in Firestore under `remixes/{id}`.
 *
 * A remix is a landing page someone else made for us: they convert a recipe,
 * they send the link to a friend, and the friend arrives on a page that is
 * mostly an argument for the app. So the document is world readable by design,
 * written once by the account that made it, and never edited after.
 *
 * The whole result goes in as one JSON string rather than a typed Firestore
 * map. It is only ever read back whole, and building nested typed values for
 * every ingredient through the REST API buys nothing for the trouble.
 */

const BASE = "https://firestore.googleapis.com/v1";

function projectId(): string {
  const id = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!id) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set");
  return id;
}

function documents(): string {
  return `${BASE}/projects/${projectId()}/databases/(default)/documents`;
}

export type RemixRecord = {
  id: string;
  diet: string;
  title: string;
  host: string;
  image: string | null;
  payload: unknown;
};

/** Short, unguessable, and safe in a URL people will paste into messages. */
function newId(): string {
  return crypto.randomBytes(9).toString("base64url");
}

export async function createRemix(
  idToken: string,
  uid: string,
  fields: {
    diet: string;
    title: string;
    host: string;
    image: string | null;
    payload: unknown;
  }
): Promise<string | null> {
  const id = newId();

  try {
    const response = await fetch(`${documents()}/remixes?documentId=${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          uid: { stringValue: uid },
          diet: { stringValue: fields.diet },
          title: { stringValue: fields.title.slice(0, 300) },
          host: { stringValue: fields.host.slice(0, 200) },
          image: fields.image
            ? { stringValue: fields.image.slice(0, 2000) }
            : { nullValue: null },
          payload: { stringValue: JSON.stringify(fields.payload) },
          created_at: { timestampValue: new Date().toISOString() },
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    // A share link is a bonus on top of the conversion, never the thing that
    // fails it: if this does not land, the result is still shown.
    return response.ok ? id : null;
  } catch {
    return null;
  }
}

/**
 * Reads a remix with no user attached. The rules make these public, and the
 * API key here is the same one already shipped in the browser bundle: it
 * identifies the project, it does not grant anything.
 */
export async function getRemix(id: string): Promise<RemixRecord | null> {
  if (!/^[A-Za-z0-9_-]{6,32}$/.test(id)) return null;

  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key) return null;

  try {
    const response = await fetch(`${documents()}/remixes/${id}?key=${key}`, {
      // A remix is immutable once written, so a link that gets shared widely
      // should be read from Firestore once and served from the cache after.
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;

    const doc = (await response.json()) as {
      fields?: Record<string, { stringValue?: string; nullValue?: null }>;
    };
    const f = doc.fields;
    if (!f?.payload?.stringValue) return null;

    return {
      id,
      diet: f.diet?.stringValue ?? "None",
      title: f.title?.stringValue ?? "Adapted recipe",
      host: f.host?.stringValue ?? "",
      image: f.image?.stringValue ?? null,
      payload: JSON.parse(f.payload.stringValue),
    };
  } catch {
    return null;
  }
}
