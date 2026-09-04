"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ImageOff, Link2 } from "lucide-react";

export type LinkPreview = {
  url: string;
  host: string;
  title: string;
  image: string | null;
  siteName: string;
};

/**
 * The card that shows what someone actually pasted. Seeing the real dish
 * before the sign-in gate is most of the reason the gate feels fair.
 */
export function RecipeLinkCard({
  preview,
  loading,
}: {
  preview: LinkPreview | null;
  loading?: boolean;
}) {
  // og:image URLs go stale or block hotlinking often enough that a broken
  // image icon is a real outcome; fall back to the placeholder instead.
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [preview?.image]);

  if (loading) {
    return (
      <div className="linkcard linkcard-loading" aria-hidden="true">
        <div className="linkcard-thumb linkcard-skeleton" />
        <div className="linkcard-body">
          <div className="linkcard-skeleton linkcard-line" />
          <div className="linkcard-skeleton linkcard-line short" />
        </div>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <motion.div
      className="linkcard"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.21, 0.65, 0.36, 1] }}
    >
      <div className="linkcard-thumb">
        {preview.image && !broken ? (
          // Arbitrary recipe hosts can't be enumerated in remotePatterns, so
          // this stays a plain img rather than going through the optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.image} alt="" onError={() => setBroken(true)} />
        ) : (
          <ImageOff size={20} strokeWidth={1.8} aria-hidden="true" />
        )}
      </div>
      <div className="linkcard-body">
        <p className="linkcard-title">{preview.title}</p>
        <p className="linkcard-host">
          <Link2 size={13} strokeWidth={2.2} aria-hidden="true" />
          {preview.host}
        </p>
      </div>
    </motion.div>
  );
}
