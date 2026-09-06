import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ConvertResult, type ConvertResponse } from "@/components/ConvertResult";
import type { LinkPreview } from "@/components/RecipeLinkCard";
import { getRemix } from "@/lib/remix";

export const runtime = "nodejs";
// Remixes never change once written, so a shared link can be cached hard and
// served from the edge for everyone it reaches after the first visitor.
export const revalidate = 3600;

type Params = { params: Promise<{ id: string }> };

function dietWord(diet: string): string {
  return diet === "None" ? "adapted" : diet.toLowerCase();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const remix = await getRemix(id);
  if (!remix) return { title: "Remix not found" };

  const word = dietWord(remix.diet);
  return {
    title: `The ${word} version of ${remix.title}`,
    description: `Curious what the ${word} version looks like? See the swaps, then remix any recipe of your own with Plateful.`,
    alternates: { canonical: `/r/${id}` },
    openGraph: {
      type: "article",
      title: `The ${word} version of ${remix.title}`,
      description: "Every swap, and the reason behind it. Remix your own recipe free.",
    // Declaring openGraph replaces the root object wholesale, and it takes the
    // segment's own opengraph-image file with it. Naming the card explicitly
    // is what keeps a shared remix from arriving with no picture, which would
    // leave the entire feature pointless.
      images: [
        {
          url: `/r/${id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `The ${word} version of ${remix.title}, remixed with Plateful`,
        },
      ],
    },
  };
}

export default async function RemixPage({ params }: Params) {
  const { id } = await params;
  const remix = await getRemix(id);
  if (!remix) notFound();

  const result = remix.payload as ConvertResponse & { url?: string };
  const preview: LinkPreview | null = remix.host
    ? {
        url: result.url ?? "",
        host: remix.host,
        title: remix.title,
        image: remix.image,
        siteName: remix.host,
      }
    : null;

  const word = dietWord(remix.diet);

  return (
    <>
      <SiteNav />

      <main className="container remix-page">
        <header className="remix-head">
          <p className="eyebrow">Remixed with Plateful</p>
          <h1>
            Curious what the <span className="accent">{word}</span> version
            looks like?
          </h1>
          <p className="remix-sub">
            Someone ran {remix.title} through Plateful. Here is what changed,
            and why.
          </p>
        </header>

        <div className="convert">
          <ConvertResult result={result} preview={preview} variant="shared" />
        </div>

        <p className="remix-foot">
          <Link href="/convert">Remix a recipe of your own</Link>, free, no card
          needed.
        </p>
      </main>

      <SiteFooter />
    </>
  );
}
