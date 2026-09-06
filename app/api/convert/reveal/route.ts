import { NextResponse } from "next/server";

import { claimFreeConversion, hasUsedFreeConversion } from "@/lib/free-conversion";
import { verifyIdToken } from "@/lib/verify-token";
import { open } from "@/lib/envelope";
import { createRemix } from "@/lib/remix";
import { UNLIMITED_CONVERSIONS, type SealedResult } from "@/lib/conversion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Opens a conversion that was run before the visitor had an account, and books
 * it against the account they just made. No AI runs here, so this is fast and
 * cheap however many times it is called.
 */
export async function POST(request: Request) {
  let body: { envelope?: string; idToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { envelope, idToken } = body;

  if (!idToken) {
    return NextResponse.json({ error: "Sign in to open this." }, { status: 401 });
  }
  const user = await verifyIdToken(idToken);
  if (!user) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  const result = envelope ? open<SealedResult>(envelope) : null;
  if (!result) {
    return NextResponse.json(
      { error: "This result expired. Please convert the recipe again." },
      { status: 410 }
    );
  }

  try {
    if (!UNLIMITED_CONVERSIONS) {
      if (await hasUsedFreeConversion(user.uid, idToken)) {
        return NextResponse.json(
          { error: "free_conversion_used" },
          { status: 403 }
        );
      }
      await claimFreeConversion(user.uid, idToken, result.url, result.diet);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // The share link is the marketing half of this: a remix someone sends on is
  // a landing page we did not have to buy. It is best effort, so a failure
  // here never costs them the result they just waited for.
  const original = result.original as {
    title?: string;
    image_url?: string | null;
  } | null;

  const remixId = await createRemix(idToken, user.uid, {
    diet: result.diet,
    title: original?.title ?? "Adapted recipe",
    host: hostOf(result.url),
    image: original?.image_url ?? null,
    payload: result,
  });

  return NextResponse.json({ result: { ...result, remixId } });
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
