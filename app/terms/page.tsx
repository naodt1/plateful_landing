import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Plateful.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <SiteNav />
      <main className="container legal">
        <div className="legal-wrap">
          <Link href="/" className="legal-back">
            <ArrowLeft size={15} strokeWidth={2.4} aria-hidden="true" />
            Back to Plateful
          </Link>

          <h1>Terms of Service</h1>
          <p className="legal-updated">Last updated: August 18, 2026</p>

          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of
            the Plateful mobile app and website (together, the
            &quot;Service&quot;), operated by Plateful (&quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;). By using the Service, you
            agree to these Terms.
          </p>

          <h2>Using Plateful</h2>
          <p>
            Plateful lets you save recipes from social media, video, and web
            sources, and automatically adapts them to your stated diet and
            preferences. You must be at least 13 years old to use the
            Service. You&apos;re responsible for the accuracy of any
            preferences, allergies, or restrictions you enter, and for
            making your own final judgment about whether a recipe is safe
            for you to eat.
          </p>

          <h2>Your account</h2>
          <p>
            You&apos;re responsible for maintaining the confidentiality of
            your account and for all activity that occurs under it. Let us
            know right away if you suspect unauthorized use of your
            account.
          </p>

          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>
              Use the Service to import content you don&apos;t have the
              right to save or reproduce for personal use.
            </li>
            <li>
              Attempt to disrupt, reverse-engineer, or gain unauthorized
              access to the Service or its underlying systems.
            </li>
            <li>Use the Service for any unlawful purpose.</li>
            <li>
              Misuse the AI-powered import or healthify features to generate
              content unrelated to recipes or cooking.
            </li>
          </ul>

          <h2>Imported content and third-party sources</h2>
          <p>
            Recipes you import remain the intellectual property of their
            original creators. Plateful extracts, reformats, and adapts
            this content solely to help you cook and plan meals for your
            own personal, non-commercial use. We are not affiliated with
            TikTok, Instagram, YouTube, or any recipe website, and we make
            no claims of ownership over content you import from them.
          </p>

          <h2>AI-generated adaptations</h2>
          <p>
            Features like Tailor and Healthify use AI to suggest ingredient
            swaps, adjust recipes for dietary needs, and estimate nutrition.
            These suggestions are provided for convenience and are not
            medical or nutritional advice. Always use your own judgment,
            especially if you have food allergies or a medical condition,
            and consult a qualified professional for dietary guidance.
          </p>

          <h2>The Service is provided &quot;as is&quot;</h2>
          <p>
            Plateful is provided free of charge and on an &quot;as is&quot;
            and &quot;as available&quot; basis, without warranties of any
            kind, whether express or implied. We don&apos;t guarantee the
            Service will be uninterrupted, error-free, or that imported or
            AI-adapted recipes will always be accurate.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, Plateful and its
            creators are not liable for any indirect, incidental, or
            consequential damages arising from your use of the Service,
            including any reliance on recipe content, nutritional
            estimates, or AI-generated suggestions.
          </p>

          <h2>Changes and termination</h2>
          <p>
            We may modify or discontinue the Service, or suspend or
            terminate your access, at any time, including for violation of
            these Terms. We may also update these Terms from time to time;
            continued use of the Service after changes means you accept the
            updated Terms.
          </p>

          <h2>Governing law</h2>
          <p>
            These Terms are governed by the laws applicable to where
            Plateful operates, without regard to conflict of law
            principles, to the extent permitted by your local law.
          </p>

          <h2>Contact us</h2>
          <p>
            Questions about these Terms? Email us at{" "}
            <a href="mailto:support@plateful.app">support@plateful.app</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
