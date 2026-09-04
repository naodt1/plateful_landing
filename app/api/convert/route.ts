import { NextResponse } from "next/server";

import {
  NoRecipeFoundError,
  extractRecipe,
  tailorRecipe,
} from "@/lib/plateful-backend";
import { claimFreeConversion, hasUsedFreeConversion } from "@/lib/free-conversion";
import { verifyIdToken } from "@/lib/verify-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
 * Coarse per-IP throttle. Sign-in is already required before anything here
 * costs money, so this only exists to blunt scripted bursts. It lives in
 * instance memory, so it is a speed bump rather than a guarantee.
 */
const HOURLY_LIMIT = 10;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > HOURLY_LIMIT;
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

  if (!idToken) {
    return NextResponse.json(
      { error: "Sign in to convert a recipe." },
      { status: 401 }
    );
  }

  const user = await verifyIdToken(idToken);
  if (!user) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  if (!url || !isSupportedUrl(url)) {
    return NextResponse.json(
      { error: "Paste a valid recipe link starting with http or https." },
      { status: 400 }
    );
  }
  if (!DIETS.includes(diet)) {
    return NextResponse.json({ error: "Unknown diet." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const cleanAllergies = (Array.isArray(allergies) ? allergies : [])
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 12);

  try {
    // Check before spending anything, so a used-up account fails instantly.
    if (await hasUsedFreeConversion(user.uid, idToken)) {
      return NextResponse.json(
        { error: "free_conversion_used" },
        { status: 403 }
      );
    }

    // Do the work first, then claim. Claiming up front would be tighter
    // against parallel requests, but it would also burn someone's single free
    // conversion when a link is broken or the rewrite fails, which is a much
    // worse trade for a funnel. Parallel abuse stays bounded by the IP limit.
    const recipe = await extractRecipe(url);
    const tailored = await tailorRecipe(recipe, diet, cleanAllergies);

    // Best effort: if this races and loses, they still see this one result.
    await claimFreeConversion(user.uid, idToken, url, diet);

    return NextResponse.json({
      original: recipe,
      tailored: tailored.tailoredRecipe,
      changes: tailored.changes,
      assessment: tailored.overallAssessment ?? null,
      warnings: tailored.warnings ?? [],
      diet,
    });
  } catch (error) {
    if (error instanceof NoRecipeFoundError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
