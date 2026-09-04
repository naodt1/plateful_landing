/**
 * Shared between the convert and reveal routes. A route file may only export
 * the handlers and Next's own config, so anything both sides need lives here.
 */

export type SealedResult = {
  url: string;
  diet: string;
  original: unknown;
  tailored: unknown;
  changes: unknown[];
  assessment: string | null;
  warnings: string[];
};

/**
 * Testing hatch. With PLATEFUL_UNLIMITED_CONVERSIONS=true an account can
 * convert as often as it likes and nothing is booked against it, so walking
 * the flow does not burn a real slot. Leave it unset in production: the whole
 * funnel rests on the conversion being the one you get for free.
 */
export const UNLIMITED_CONVERSIONS =
  process.env.PLATEFUL_UNLIMITED_CONVERSIONS === "true";
