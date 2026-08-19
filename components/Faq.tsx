"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is Plateful free?",
    a: "Yes. Plateful is free to download and use — saving, tailoring, and healthifying recipes doesn't cost anything.",
  },
  {
    q: "What can I import recipes from?",
    a: "Any link you can share: TikTok, Instagram, YouTube, or pretty much any recipe website. Screenshots are coming soon.",
  },
  {
    q: "How does Plateful know what fits my diet?",
    a: "Set your diet, allergies, and preferences once in your profile. Every recipe you import gets adapted to fit automatically.",
  },
  {
    q: "How accurate is the import?",
    a: "Plateful reads the full video or page, not just the caption, so you get real ingredients, quantities, and steps, not a guess.",
  },
  {
    q: "Is there an iOS app?",
    a: "Not yet, iOS is coming soon. Tap “Coming soon on iOS” up top to join the waitlist and we'll email you the moment it's live.",
  },
  {
    q: "What happens to my data?",
    a: (
      <>
        We don&apos;t sell your information. See exactly what we collect and
        why in our <Link href="/privacy">Privacy Policy</Link>.
      </>
    ),
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {faqs.map((item, i) => {
        const open = openIndex === i;
        return (
          <div className="faq-item" key={item.q}>
            <button
              type="button"
              className="faq-question"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : i)}
            >
              {item.q}
              <span
                className={`faq-icon${open ? " is-open" : ""}`}
                aria-hidden="true"
              >
                <Plus size={16} strokeWidth={2.4} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.21, 0.65, 0.36, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="faq-answer">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
