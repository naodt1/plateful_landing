import Image from "next/image";
import { Reveal, RevealStagger, RevealItem } from "@/components/Reveal";
import { StoreButtons } from "@/components/StoreButtons";
import { GlobeIcon, YouTubeIcon, TikTokIcon } from "@/components/icons";

import platefulLogo from "@/public/play_store_512.png";
import screenRecipe from "@/public/screens/screen-recipe.png";
import screenHealthify from "@/public/screens/screen-healthify.png";
import screenTailor from "@/public/screens/screen-tailor.png";
import screenPlan from "@/public/screens/screen-plan.png";
import screenGrocery from "@/public/screens/screen-grocery.png";
import screenPantry from "@/public/screens/screen-pantry.png";

const features = [
  {
    icon: "🔗",
    bg: "#eef4ef",
    title: "Import instantly",
    body: "Share a link from TikTok, Instagram, YouTube or any website and AI extracts the full recipe in seconds.",
  },
  {
    icon: "🍳",
    bg: "#fdf1e2",
    title: "Step-by-step cooking",
    body: "Adjust servings on the fly and follow a clean, hands-free cooking mode from prep to plate.",
  },
  {
    icon: "🥗",
    bg: "#eef4ef",
    title: "Tailor to your diet",
    body: "Set diet and allergy preferences once and every recipe adapts to fit the way you eat.",
  },
  {
    icon: "🌿",
    bg: "#fdf1e2",
    title: "Healthify any meal",
    body: "Get smart ingredient swaps that cut calories and sodium while keeping the flavor.",
  },
  {
    icon: "🛒",
    bg: "#eef4ef",
    title: "Auto grocery lists",
    body: "Plan your week and Plateful builds an organized grocery list automatically.",
  },
  {
    icon: "🥫",
    bg: "#fdf1e2",
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
    "Save recipes from TikTok, Instagram, YouTube or any website, then tailor them to your diet, servings, and taste. Plan your week, build grocery lists automatically, and cook from your pantry.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  url: "https://plateful.app",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <nav className="container nav" aria-label="Main">
        <div className="brand">
          <div className="brand-mark">
            <Image src={platefulLogo} alt="" width={38} height={38} priority />
          </div>
          <span className="brand-name">Plateful</span>
        </div>
        <a href="#get" className="nav-cta">
          Get the app
        </a>
      </nav>

      {/* Hero */}
      <header className="container hero">
        <Reveal>
          <h1>
            Any recipe,
            <br />
            your way.
          </h1>
          <p className="hero-sub">
            Save recipes from TikTok, Instagram, YouTube or any website, then
            tailor them to your diet, servings, and taste. Recipes from
            anywhere, made to fit you.
          </p>
          <div id="get">
            <StoreButtons />
          </div>
        </Reveal>

        <Reveal delay={0.15} y={40} className="hero-visual">
          <div className="hero-glow" />
          <div className="phone phone-hero floaty">
            <div className="phone-notch" />
            <Image
              src={screenRecipe}
              alt="Plateful recipe screen showing an imported recipe"
              priority
              sizes="288px"
            />
          </div>
        </Reveal>
      </header>

      {/* Features */}
      <section className="section-white" aria-labelledby="features-title">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Everything in one place</p>
            <h2 id="features-title" className="section-title">
              From a random link to dinner on the table
            </h2>
          </Reveal>

          <RevealStagger className="feat-grid">
            {features.map((f) => (
              <RevealItem key={f.title} className="feat-card">
                <div className="feat-icon" style={{ background: f.bg }}>
                  <span aria-hidden="true">{f.icon}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* Import sources */}
      <section className="section-green" aria-labelledby="import-title">
        <div className="container import-inner">
          <Reveal>
            <p className="eyebrow on-dark">One tap to import</p>
            <h2 id="import-title" className="section-title">
              Bring recipes in from anywhere
            </h2>
            <p className="import-sub">
              Share a link and AI pulls out the full recipe, clean and
              cookable. It works with:
            </p>
          </Reveal>
          <RevealStagger className="import-chips">
            <RevealItem className="chip">
              <GlobeIcon />
              Recipe websites
            </RevealItem>
            <RevealItem className="chip">
              <YouTubeIcon />
              YouTube
            </RevealItem>
            <RevealItem className="chip">
              <TikTokIcon />
              TikTok
            </RevealItem>
            <RevealItem className="chip chip-soon">
              <span style={{ fontSize: 20 }} aria-hidden="true">
                🖼️
              </span>
              Screenshots <span className="soon-badge">SOON</span>
            </RevealItem>
          </RevealStagger>
        </div>
      </section>

      {/* Showcase: Healthify */}
      <section className="container showcase" aria-labelledby="healthify-title">
        <Reveal>
          <div className="showcase-badge">🌿 Healthify</div>
          <h2 id="healthify-title">Healthier swaps, same great meal</h2>
          <p className="showcase-body">
            Let AI suggest healthier ingredient swaps like brown rice for
            white, olive oil for butter, and less sodium, with the reasoning
            behind each one and the calories you&apos;ll save.
          </p>
          <ul className="check-list">
            <li>
              <span className="check" aria-hidden="true">
                ✓
              </span>
              One-tap ingredient swaps
            </li>
            <li>
              <span className="check" aria-hidden="true">
                ✓
              </span>
              See calories saved per serving
            </li>
            <li>
              <span className="check" aria-hidden="true">
                ✓
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
              sizes="262px"
            />
          </div>
        </Reveal>
      </section>

      {/* Showcase: Tailor */}
      <section className="section-green" aria-labelledby="tailor-title">
        <div className="container showcase" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <Reveal
            delay={0.1}
            y={36}
            className="showcase-visual first-on-mobile"
          >
            <div className="phone phone-md phone-dark-green">
              <Image
                src={screenTailor}
                alt="Plateful Tailor screen adapting a recipe to preferences"
                sizes="262px"
              />
            </div>
          </Reveal>
          <Reveal>
            <div className="showcase-badge on-dark">⚙️ Tailor</div>
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

      {/* Screens gallery */}
      <section className="gallery" aria-labelledby="gallery-title">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Your whole kitchen</p>
            <h2 id="gallery-title" className="section-title">
              Plan, shop, and cook from one app
            </h2>
          </Reveal>

          <RevealStagger className="gallery-grid">
            {galleryItems.map((item) => (
              <RevealItem key={item.title} className="gallery-item">
                <div className="phone phone-sm">
                  <Image src={item.image} alt={item.alt} sizes="240px" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta" aria-labelledby="cta-title">
        <Reveal className="cta-inner">
          <div className="cta-mark">
            <Image src={platefulLogo} alt="" width={60} height={60} />
          </div>
          <h2 id="cta-title">Make every recipe your own</h2>
          <p>Free to download. Save your first recipe in seconds.</p>
          <StoreButtons center />
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-mark">
              <Image src={platefulLogo} alt="" width={30} height={30} />
            </div>
            <span className="footer-name">Plateful</span>
          </div>
          <span className="footer-note">
            © {new Date().getFullYear()} Plateful. Cook from anywhere.
          </span>
        </div>
      </footer>
    </>
  );
}
