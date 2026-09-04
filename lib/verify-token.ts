import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Verifies a Firebase ID token server side without needing an Admin service
 * account: Firebase signs ID tokens with Google's rotating public keys, so we
 * check the signature against the published JWKS plus the issuer/audience that
 * are specific to this project.
 */
const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export type VerifiedUser = { uid: string; email: string | null };

export async function verifyIdToken(
  idToken: string
): Promise<VerifiedUser | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;

  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    // Firebase puts the uid in `sub`; reject anything without one.
    const uid = typeof payload.sub === "string" ? payload.sub : null;
    if (!uid) return null;

    const email = typeof payload.email === "string" ? payload.email : null;
    return { uid, email };
  } catch {
    return null;
  }
}
