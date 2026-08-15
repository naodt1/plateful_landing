import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = "https://plateful.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Plateful: Any Recipe. Your Diet.",
    template: "%s | Plateful",
  },
  description:
    "Save any recipe from TikTok, YouTube, or the web. Plateful adapts it to fit your diet automatically, and you can make any recipe even healthier with one tap.",
  keywords: [
    "recipe app",
    "recipe organizer",
    "save recipes from TikTok",
    "import recipes",
    "meal planning app",
    "grocery list app",
    "pantry tracker",
    "healthy ingredient swaps",
    "AI recipe app",
    "Plateful",
  ],
  applicationName: "Plateful",
  authors: [{ name: "Plateful" }],
  creator: "Plateful",
  category: "food",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Plateful",
    title: "Plateful: Any Recipe. Your Diet.",
    description:
      "Save any recipe from TikTok, YouTube, or the web. Plateful adapts it to fit your diet automatically, and you can make any recipe even healthier with one tap.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plateful: Any Recipe. Your Diet.",
    description:
      "Save any recipe from TikTok, YouTube, or the web. Plateful adapts it to fit your diet automatically, and you can make any recipe even healthier with one tap.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
