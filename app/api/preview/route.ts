import { NextResponse } from "next/server";

import { fetchPublicPage } from "@/lib/safe-fetch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Reads the Open Graph card off a pasted recipe link so the tool can show what
 * someone is about to convert. No AI, no auth: this is the cheap step that
 * runs before the sign-in gate.
 */

const HOURLY_LIMIT = 40;
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

function decode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** Pulls one meta tag's content, tolerating attribute order and quote style. */
function meta(html: string, ...names: string[]): string | null {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["']`,
        "i"
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["']`,
        "i"
      ),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]?.trim()) return decode(match[1]);
    }
  }
  return null;
}

/**
 * The two sources the landing page leads with are also the two that hand a
 * consent wall to anything scraping their HTML, so they go through the oEmbed
 * endpoints they publish for exactly this instead.
 */
const OEMBED: Record<string, string> = {
  "youtube.com": "https://www.youtube.com/oembed?format=json&url=",
  "m.youtube.com": "https://www.youtube.com/oembed?format=json&url=",
  "youtu.be": "https://www.youtube.com/oembed?format=json&url=",
  "tiktok.com": "https://www.tiktok.com/oembed?url=",
  "vm.tiktok.com": "https://www.tiktok.com/oembed?url=",
  "vt.tiktok.com": "https://www.tiktok.com/oembed?url=",
};

async function viaOembed(rawUrl: string, host: string) {
  const endpoint = OEMBED[host];
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint + encodeURIComponent(rawUrl), {
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      title?: string;
      thumbnail_url?: string;
      author_name?: string;
      provider_name?: string;
    };

    return {
      url: rawUrl,
      host,
      title: data.title?.trim() || host,
      image: data.thumbnail_url ?? null,
      siteName: data.author_name || data.provider_name || host,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = body.url?.trim();
  if (!raw) {
    return NextResponse.json({ error: "Paste a link first." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const requested = new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
    const embedded = await viaOembed(raw, requested);
    if (embedded) return NextResponse.json(embedded);

    const { html, finalUrl } = await fetchPublicPage(raw);
    const host = new URL(finalUrl).hostname.replace(/^www\./, "");

    const title =
      meta(html, "og:title", "twitter:title") ??
      decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "") ??
      null;

    const rawImage = meta(html, "og:image:secure_url", "og:image", "twitter:image");
    // Relative og:image values are common; resolve them against the page.
    let image: string | null = null;
    if (rawImage) {
      try {
        image = new URL(rawImage, finalUrl).toString();
      } catch {
        image = null;
      }
    }

    return NextResponse.json({
      url: finalUrl,
      host,
      title: title || host,
      image,
      siteName: meta(html, "og:site_name") ?? host,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not read that link.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
