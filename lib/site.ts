export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.naodtadele.plateful";

/** The domain this site is meant to live on once DNS points here. */
export const CANONICAL_URL = "https://plateful.app";

/**
 * Where the site is actually being served from right now.
 *
 * Social previews need absolute URLs, and X fetches og:image from this origin.
 * Hardcoding the canonical domain means every deploy that isn't that domain
 * (previews, or the live site before DNS is switched over) advertises an image
 * URL that nothing serves, so the card renders with no image.
 *
 * Order: explicit override, Vercel's stable production domain, the
 * per-deployment URL, then the canonical domain as a last resort.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : CANONICAL_URL);
