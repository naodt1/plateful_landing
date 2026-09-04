import dns from "node:dns/promises";
import net from "node:net";

/**
 * Fetching a URL a stranger typed in is an SSRF hole if you do it naively: the
 * host could resolve to a private address and turn this endpoint into a probe
 * for whatever is reachable from the server. So every hop, including redirect
 * targets, gets its resolved address checked before we connect.
 */

const MAX_REDIRECTS = 3;
const MAX_BYTES = 600_000; // enough for a <head>, not enough to be a download

function isBlockedAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier grade NAT
    return false;
  }
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  if (lower.startsWith("fe80")) return true; // link local
  if (lower.startsWith("::ffff:")) return isBlockedAddress(lower.slice(7));
  return false;
}

async function assertPublicHost(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https links are supported.");
  }
  const results = await dns.lookup(url.hostname, { all: true });
  if (!results.length || results.some((r) => isBlockedAddress(r.address))) {
    throw new Error("That link points somewhere we can't fetch.");
  }
}

/** Fetches a public page as text, following redirects safely and capping size. */
export async function fetchPublicPage(rawUrl: string): Promise<{
  html: string;
  finalUrl: string;
}> {
  let current = new URL(rawUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(current);

    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
      headers: {
        // Identifying as a crawler beats pretending to be Chrome here: the
        // Dotdash sites (Allrecipes, Serious Eats) serve crawlers the page and
        // answer browsers with a 402, and nothing gains from the pretence.
        "User-Agent":
          "Mozilla/5.0 (compatible; PlatefulBot/1.0; +https://plateful.naodtadele.com)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("That link could not be followed.");
      current = new URL(location, current);
      continue;
    }

    if (!response.ok) {
      throw new Error(`That link returned ${response.status}.`);
    }

    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("html")) {
      // Still a valid link, just nothing to read meta tags out of.
      return { html: "", finalUrl: current.toString() };
    }

    // Read a bounded slice rather than trusting content-length.
    const reader = response.body?.getReader();
    if (!reader) return { html: "", finalUrl: current.toString() };

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (total < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
    }
    void reader.cancel();

    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk.subarray(0, Math.min(chunk.length, total - offset)), offset);
      offset += chunk.length;
    }

    return {
      html: new TextDecoder("utf-8").decode(merged),
      finalUrl: current.toString(),
    };
  }

  throw new Error("That link redirected too many times.");
}
