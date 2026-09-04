export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.naodtadele.plateful";

/**
 * The domain the site is actually served from today. plateful.app is the
 * eventual home, but it currently resolves to a host that answers nothing, so
 * it must not be the fallback: pointing social cards at a dead origin is how
 * you end up with a link preview that has no image.
 */
export const CANONICAL_URL = "https://plateful.naodtadele.com";

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
