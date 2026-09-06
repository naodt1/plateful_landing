import type { Metadata } from "next";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ConvertTool } from "@/components/ConvertTool";
import { PlatformNote } from "@/components/PlatformNote";

export const metadata: Metadata = {
  title: "Convert Any Recipe To Your Diet",
  description:
    "Paste any recipe link from TikTok, YouTube, or the web and Plateful rewrites it to fit your diet, with the reasoning behind every swap. One free conversion.",
  alternates: { canonical: "/convert" },
  openGraph: {
    title: "Convert Any Recipe To Your Diet | Plateful",
    description:
      "Paste any recipe link and Plateful rewrites it to fit your diet. One free conversion.",
    // Declaring openGraph here replaces the root object wholesale, which drops
    // the shared opengraph-image file with it. Naming it keeps this page's
    // card from going out with no image at all.
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Any recipe, your diet. Recipes from TikTok, YouTube, Instagram and the web flow into Plateful and come out adapted to a vegan, high protein, nut free diet.",
      },
    ],
  },
};

export default function ConvertPage() {
  return (
    <>
      <SiteNav />

      <main className="container convert-page">
        <header className="convert-head">
          <p className="eyebrow">Free tool</p>
          <h1>
            Convert any recipe to <span className="accent">your diet</span>.
          </h1>
          <p className="convert-sub">
            Paste a link from TikTok, YouTube, or any recipe site. Plateful
            pulls out the full recipe and rewrites it to fit the way you eat,
            with the reasoning behind every swap.
          </p>
        </header>

        <ConvertTool />

        <PlatformNote />
      </main>

      <SiteFooter />
    </>
  );
}
