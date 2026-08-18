import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Plateful collects, uses, and protects your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteNav />
      <main className="container legal">
        <div className="legal-wrap">
          <Link href="/" className="legal-back">
            <ArrowLeft size={15} strokeWidth={2.4} aria-hidden="true" />
            Back to Plateful
          </Link>

          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: August 18, 2026</p>

          <p>
            This Privacy Policy explains how Plateful (&quot;Plateful,&quot;
            &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects,
            uses, and shares information when you use our mobile app and
            this website (together, the &quot;Service&quot;).
          </p>

          <h2>Information we collect</h2>
          <p>When you use Plateful, we may collect:</p>
          <ul>
            <li>
              <strong>Account information</strong> — your email address and
              any profile details you choose to add.
            </li>
            <li>
              <strong>Recipe content</strong> — links, screenshots, or text
              you share into the app so we can extract and store a recipe
              for you.
            </li>
            <li>
              <strong>Diet and preference data</strong> — dietary
              restrictions, allergies, and taste preferences you enter so
              recipes can be tailored to you. This is only used to
              personalize your experience and is never sold.
            </li>
            <li>
              <strong>Usage data</strong> — how you interact with the app,
              such as which features you use, to help us improve it.
            </li>
            <li>
              <strong>Device and log data</strong> — basic technical
              information like device type, operating system, and crash
              reports.
            </li>
            <li>
              <strong>Waitlist submissions</strong> — if you join our iOS
              waitlist on this website, we collect the email address you
              provide, via our form provider, Formspree.
            </li>
          </ul>

          <h2>How we use your information</h2>
          <ul>
            <li>To provide, operate, and maintain the Service.</li>
            <li>
              To extract, clean, and format recipes from the links or
              content you share, including using third-party AI services to
              process that content on your behalf.
            </li>
            <li>
              To personalize recipes, meal plans, and grocery lists to your
              stated diet and preferences.
            </li>
            <li>To notify you when features you&apos;ve asked about launch.</li>
            <li>To detect, prevent, and address technical issues or abuse.</li>
          </ul>

          <h2>How we share information</h2>
          <p>
            We do not sell your personal information. We share information
            only with:
          </p>
          <ul>
            <li>
              Service providers who help us run Plateful, such as hosting,
              analytics, AI processing, and email delivery providers, bound
              by obligations to protect your data.
            </li>
            <li>
              App marketplaces (Google Play, and Apple&apos;s App Store once
              available) as required to distribute the app to you.
            </li>
            <li>Authorities, if required by law or to protect our users.</li>
          </ul>

          <h2>This website</h2>
          <p>
            plateful.app uses Vercel Analytics to understand aggregate
            traffic to this site. This does not use cookies to track you
            across other websites. If you submit the iOS waitlist form,
            your email is processed by Formspree solely to notify you when
            iOS launches.
          </p>

          <h2>Data retention</h2>
          <p>
            We retain your information for as long as your account is
            active or as needed to provide the Service. You can request
            deletion of your account and associated data at any time by
            contacting us below.
          </p>

          <h2>Your rights and choices</h2>
          <p>
            Depending on where you live, you may have the right to access,
            correct, export, or delete your personal information, and to
            object to or restrict certain processing. To exercise any of
            these rights, contact us at the email below.
          </p>

          <h2>Children&apos;s privacy</h2>
          <p>
            Plateful is not directed to children under 13, and we do not
            knowingly collect personal information from children under 13.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will
            post the updated version here with a new &quot;Last
            updated&quot; date.
          </p>

          <h2>Contact us</h2>
          <p>
            Questions about this policy? Email us at{" "}
            <a href="mailto:support@plateful.app">support@plateful.app</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
