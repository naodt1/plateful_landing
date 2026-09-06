import { NextResponse } from "next/server";

import {
  ConversionTimeoutError,
  NoRecipeFoundError,
  extractRecipe,
  tailorRecipe,
} from "@/lib/plateful-backend";
import { claimFreeConversion, hasUsedFreeConversion } from "@/lib/free-conversion";
import { verifyIdToken } from "@/lib/verify-token";
import { seal } from "@/lib/envelope";
import { createRemix } from "@/lib/remix";
import { UNLIMITED_CONVERSIONS, type SealedResult } from "@/lib/conversion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 60s is the ceiling on Vercel's Hobby plan and well within Pro's, so it is the
 * safe number to ask for. The pipeline is held to a shorter deadline than this
 * on purpose: a step that overruns should fail with a sentence someone can act
 * on, not be cut off by the platform and surface as a bare gateway error.
 */
export const maxDuration = 60;
const PIPELINE_BUDGET_MS = 54_000;

const DIETS = [
  "None",
  "Vegan",
  "Vegetarian",
  "Keto",
  "Paleo",
  "Gluten-Free",
  "Halal",
];

/**
 * Coarse per-IP throttle, and the only thing standing between a script and the
 * AI bill: the recipe is now converted before anyone signs in, so a signed out
 * request costs real money. Signed in callers are attributable and get the
 * looser limit. It lives in instance memory, so it is a speed bump rather than
 * a guarantee.
 */
const ANON_HOURLY_LIMIT = 6;
const SIGNED_IN_HOURLY_LIMIT = 10;

const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string, limit: number): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

function isSupportedUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: { url?: string; diet?: string; allergies?: string[]; idToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { url, diet = "None", allergies = [], idToken } = body;

  if (!url || !isSupportedUrl(url)) {
    return NextResponse.json(
      { error: "Paste a valid recipe link starting with http or https." },
      { status: 400 }
    );
  }
  if (!DIETS.includes(diet)) {
    return NextResponse.json({ error: "Unknown diet." }, { status: 400 });
  }

  // Signing in is optional here. Someone already signed in gets their result
  // straight back, and gets told before anything is spent if their free one is
  // gone. Everyone else gets it sealed and opens it at /api/convert/reveal.
  const user = idToken ? await verifyIdToken(idToken) : null;
  if (idToken && !user) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const limit = UNLIMITED_CONVERSIONS
    ? 200
    : user
      ? SIGNED_IN_HOURLY_LIMIT
      : ANON_HOURLY_LIMIT;
  if (rateLimited(ip, limit)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const cleanAllergies = (Array.isArray(allergies) ? allergies : [])
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 12);

  const deadline = Date.now() + PIPELINE_BUDGET_MS;

  try {
    if (user && idToken && !UNLIMITED_CONVERSIONS) {
      // Check before spending anything, so a used-up account fails instantly.
      if (await hasUsedFreeConversion(user.uid, idToken)) {
        return NextResponse.json(
          { error: "free_conversion_used" },
          { status: 403 }
        );
      }
    }

    const recipe = await extractRecipe(url, deadline);
    const tailored = await tailorRecipe(recipe, diet, cleanAllergies, deadline);

    const result: SealedResult = {
      url,
      diet,
      original: recipe,
      tailored: tailored.tailoredRecipe,
      changes: tailored.changes,
      assessment: tailored.overallAssessment ?? null,
      warnings: tailored.warnings ?? [],
    };

    if (user && idToken) {
      // Best effort: if this races and loses, they still see this one result.
      if (!UNLIMITED_CONVERSIONS) {
        await claimFreeConversion(user.uid, idToken, url, diet);
      }
      const remixId = await createRemix(idToken, user.uid, {
        diet,
        title: recipe.title ?? "Adapted recipe",
        host: new URL(url).hostname.replace(/^www\./, ""),
        image: recipe.image_url ?? null,
        payload: result,
      });
      return NextResponse.json({ revealed: true, result: { ...result, remixId } });
    }

    return NextResponse.json({
      revealed: false,
      envelope: seal(result),
      // Enough to make the wait feel finished without giving the recipe away.
      teaser: {
        title: tailored.tailoredRecipe.title ?? recipe.title ?? null,
        changeCount: tailored.changes.length,
        diet,
      },
    });
  } catch (error) {
    if (error instanceof NoRecipeFoundError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    if (error instanceof ConversionTimeoutError) {
      return NextResponse.json({ error: error.message }, { status: 504 });
    }
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
