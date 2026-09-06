import Image from "next/image";
import {
  Check,
  ChefHat,
  Globe,
  Leaf,
  Link2,
  Refrigerator,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react";

import { Reveal, RevealStagger, RevealItem } from "@/components/Reveal";
import { StoreButtons } from "@/components/StoreButtons";
import { Platforms } from "@/components/Platforms";
import { ImportFlow } from "@/components/ImportFlow";
import { Faq } from "@/components/Faq";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { YouTubeIcon, TikTokIcon } from "@/components/icons";
import { SITE_URL } from "@/lib/site";

import platefulLogo from "@/public/play_store_512.png";
import screenRecipe from "@/public/screens/screen-recipe.png";
import screenHealthify from "@/public/screens/screen-healthify.png";
import screenTailor from "@/public/screens/screen-tailor.png";
import screenPlan from "@/public/screens/screen-plan.png";
import screenGrocery from "@/public/screens/screen-grocery.png";
import screenPantry from "@/public/screens/screen-pantry.png";

const features = [
  {
    Icon: Link2,
    title: "Import instantly",
    body: "Share a link from TikTok, Instagram, YouTube or any website and AI extracts the full recipe in seconds.",
  },
  {
    Icon: ChefHat,
    title: "Step-by-step cooking",
    body: "Adjust servings on the fly and follow a clean, hands-free cooking mode from prep to plate.",
  },
  {
    Icon: SlidersHorizontal,
    title: "Tailor to your diet",
    body: "Set diet and allergy preferences once and every recipe adapts to fit the way you eat.",
  },
  {
    Icon: Leaf,
    title: "Healthify any meal",
    body: "Get smart ingredient swaps that cut calories and sodium while keeping the flavor.",
  },
  {
    Icon: ShoppingCart,
    title: "Auto grocery lists",
    body: "Plan your week and Plateful builds an organized grocery list automatically.",
  },
  {
    Icon: Refrigerator,
    title: "Cook from your pantry",
    body: "Find recipes you can make right now with the ingredients you already have on hand.",
  },
];

const galleryItems = [
  {
    image: screenPlan,
    alt: "Plateful weekly meal plan screen",
    title: "Plan your week",
    body: "Generate an AI meal plan or build your own, breakfast to snack.",
  },
  {
    image: screenGrocery,
    alt: "Plateful auto-generated grocery list screen",
    title: "Auto grocery lists",
    body: "Every ingredient you need, organized and ready to check off.",
  },
  {
    image: screenPantry,
    alt: "Plateful pantry tracking screen",
    title: "Cook from your pantry",
    body: "Track what you have and ask “What can I cook?” anytime.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Plateful",
  operatingSystem: "iOS, Android",
  applicationCategory: "LifestyleApplication",
  description:
    "Save any recipe from TikTok, YouTube, or the web. Plateful adapts it to fit your diet automatically, and you can make any recipe even healthier with one tap.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  url: SITE_URL,
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteNav />

      {/* ---------- 1. Hero ---------- */}
      <header className="container hero">
        <Reveal>
          <h1>
            Adapt any recipe to <span className="accent">your diet</span>.
          </h1>
          <p className="hero-sub">
            Save any recipe from TikTok, YouTube, or the web. Plateful adapts
            it to your diet automatically.
          </p>
          <StoreButtons />
        </Reveal>

        <Reveal delay={0.15} y={40} className="hero-visual">
          <span className="hero-plate" aria-hidden="true" />
          <div className="phone phone-hero floaty">
            <Image
              src={screenRecipe}
              alt="A recipe saved in Plateful, showing tags, servings, and diet controls"
              priority
              sizes="282px"
            />
          </div>
        </Reveal>
      </header>

      {/* ---------- 2. One tap import ---------- */}
      <section className="section-green" aria-labelledby="import-title">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow on-dark">One tap import</p>
            <h2 id="import-title" className="section-title">
              Watch a link become a recipe
            </h2>
            <p className="section-sub on-dark">
              Hit share on any post, pick Plateful, and the full recipe lands
              in your kitchen, already adapted to your diet and
              preferences.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ImportFlow />
          </Reveal>

          <Reveal delay={0.15}>
            <div className="sources">
              <span className="sources-label">Works with</span>
              <span className="chip">
                <span className="chip-icon chip-icon-green">
                  <Globe size={16} strokeWidth={2.2} aria-hidden="true" />
                </span>
                Recipe websites
              </span>
              <span className="chip">
                <span className="chip-icon">
                  <YouTubeIcon size={20} />
                </span>
                YouTube
              </span>
              <span className="chip">
                <span className="chip-icon">
                  <TikTokIcon size={17} />
                </span>
                TikTok
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- 3. Healthify ---------- */}
      <section className="container showcase" aria-labelledby="healthify-title">
        <Reveal>
          <span className="showcase-badge">
            <Leaf size={15} strokeWidth={2} aria-hidden="true" />
            Healthify
          </span>
          <h2 id="healthify-title">Healthier swaps, same great meal</h2>
          <p className="showcase-body">
            Swap in healthier ingredients like brown rice for white, olive
            oil for butter, and less sodium, with the reasoning behind each
            one and the calories you&apos;ll save.
          </p>
          <ul className="check-list">
            <li>
              <span className="check" aria-hidden="true">
                <Check size={17} strokeWidth={2.6} />
              </span>
              One-tap ingredient swaps
            </li>
            <li>
              <span className="check" aria-hidden="true">
                <Check size={17} strokeWidth={2.6} />
              </span>
              See calories saved per serving
            </li>
            <li>
              <span className="check" aria-hidden="true">
                <Check size={17} strokeWidth={2.6} />
              </span>
              Tailor to your diet &amp; allergies
            </li>
          </ul>
        </Reveal>
        <Reveal delay={0.1} y={36} className="showcase-visual">
          <div className="phone phone-md">
            <Image
              src={screenHealthify}
              alt="Plateful Healthify screen with healthier ingredient swaps"
              sizes="258px"
            />
          </div>
        </Reveal>
      </section>

      {/* ---------- 4. Tailor ---------- */}
      <section className="section-green" aria-labelledby="tailor-title">
        <div
          className="container showcase"
          style={{ paddingTop: 0, paddingBottom: 0 }}
        >
          <Reveal delay={0.1} y={36} className="showcase-visual first-on-mobile">
            <div className="phone phone-md phone-dark-green">
              <Image
                src={screenTailor}
                alt="Plateful Tailor screen adapting a recipe to preferences"
                sizes="258px"
              />
            </div>
          </Reveal>
          <Reveal>
            <span className="showcase-badge on-dark">
              <SlidersHorizontal size={15} strokeWidth={2} aria-hidden="true" />
              Tailor
            </span>
            <h2 id="tailor-title">Every recipe, made for you</h2>
            <p className="showcase-body on-dark">
              Set your diet and preferences once. Plateful adapts any recipe to
              fit, whether vegetarian, gluten-free, or whatever you cook by,
              and scales servings up or down with a tap.
            </p>
            <p className="showcase-body on-dark last">
              Plan your week, build grocery lists automatically, and cook from
              what&apos;s already in your pantry.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- 5. Everything in one place ---------- */}
      <section className="gallery" aria-labelledby="gallery-title">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Everything in one place</p>
            <h2 id="gallery-title" className="section-title">
              Plan, shop, and cook from one app
            </h2>
          </Reveal>

          <RevealStagger className="gallery-grid">
            {galleryItems.map((item) => (
              <RevealItem key={item.title} className="gallery-item">
                <div className="phone phone-sm">
                  <Image src={item.image} alt={item.alt} sizes="236px" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ---------- 6. Features ---------- */}
      <section className="section-white" aria-labelledby="features-title">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">What you get</p>
            <h2 id="features-title" className="section-title">
              Link in. Dinner out.
            </h2>
          </Reveal>

          <RevealStagger className="feat-grid">
            {features.map(({ Icon, title, body }) => (
              <RevealItem key={title} className="feat-card">
                <span className="feat-icon">
                  <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ---------- 7. Where you can get it ---------- */}
      <section className="platforms" aria-labelledby="platforms-title">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Where you can get it</p>
            <h2 id="platforms-title" className="section-title">
              On Android now. iPhone next.
            </h2>
            <p className="section-sub">
              Plateful is out on Google Play today. The iOS version is being
              built, and the waitlist is the first to know.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <Platforms />
          </Reveal>
        </div>
      </section>

      {/* ---------- 8. FAQ ---------- */}
      <section className="faq" aria-labelledby="faq-title">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Questions</p>
            <h2 id="faq-title" className="section-title">
              Before you ask
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* ---------- 9. Final CTA ---------- */}
      <section className="cta" aria-labelledby="cta-title">
        <div className="container">
          <Reveal className="cta-inner">
            <span className="cta-badge">
              <span className="cta-mark">
                <Image src={platefulLogo} alt="" width={56} height={56} />
              </span>
            </span>
            <h2 id="cta-title">
              Adapt any recipe to <span className="accent">your diet</span>.
            </h2>
            <p>Make any recipe fit your needs.</p>
            <StoreButtons center onDark />
          </Reveal>
        </div>
      </section>

      {/* ---------- 10. Footer ---------- */}
      <SiteFooter />
    </>
  );
}
