"use client";

import {
  ArrowRight,
  Clock3,
  Lock,
  RefreshCw,
  BookmarkPlus,
  Check,
  Link2,
  Smartphone,
  Sparkles,
  TriangleAlert,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { PLAY_STORE_URL } from "@/lib/site";
import { WaitlistModal } from "@/components/WaitlistModal";
import { AppleIcon } from "@/components/icons";
import type { LinkPreview } from "@/components/RecipeLinkCard";
import { iconForIngredient } from "@/lib/ingredient-icon";

type Ingredient = { name?: string; amount?: number; unit?: string };
type Nutrition = {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};
type Recipe = {
  title?: string;
  description?: string;
  image_url?: string | null;
  ingredients?: Ingredient[];
  steps?: string[];
  servings?: number;
  cook_time_minutes?: number;
  nutrition?: Nutrition | null;
};
type Swap = { original: string; replacement: string; reason?: string };

export type ConvertResponse = {
  original?: Recipe;
  tailored: Recipe;
  changes: Swap[];
  assessment: string | null;
  warnings: string[];
  diet: string;
  /** Set once the conversion has been published at its own share URL. */
  remixId?: string | null;
};

/**
 * A long, settled ease-out. Everything decelerates into place rather than
 * easing evenly, which is what makes a reveal read as considered instead of
 * merely animated.
 */
const EASE = [0.16, 1, 0.3, 1] as const;

function formatAmount(item: Ingredient): string {
  const amount =
    typeof item.amount === "number" && Number.isFinite(item.amount)
      ? String(Number(item.amount.toFixed(2))).replace(/\.00$/, "")
      : "";
  return [amount, item.unit].filter(Boolean).join(" ").trim();
}

const MACROS: { key: keyof Nutrition; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
];

export function ConvertResult({
  result,
  preview,
  variant = "owner",
}: {
  result: ConvertResponse;
  preview: LinkPreview | null;
  /**
   * "owner" is the person who just converted it. "shared" is whoever they sent
   * the link to, who has not spent their free remix yet and is the whole
   * reason these pages exist.
   */
  variant?: "owner" | "shared";
}) {
  const still = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [waitlist, setWaitlist] = useState(false);
  const shared = variant === "shared";
  const dietWord = result.diet === "None" ? "adapted" : result.diet.toLowerCase();

  const container: Variants = {
    hidden: {},
    show: {
      transition: still
        ? {}
        : { staggerChildren: 0.085, delayChildren: 0.06 },
    },
  };

  // Blur is what sells the arrival: things resolve into focus as they settle,
  // the way a camera finds them, rather than sliding in already sharp.
  const rise: Variants = {
    hidden: still
      ? { opacity: 0 }
      : { opacity: 0, y: 26, filter: "blur(10px)" },
    show: still
      ? { opacity: 1, transition: { duration: 0.3 } }
      : {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.8, ease: EASE },
        },
  };

  const recipe = result.tailored;
  const source = result.original;
  const hero = source?.image_url || preview?.image || null;
  const nutrition = source?.nutrition ?? null;
  const hasNumbers =
    nutrition && MACROS.some(({ key }) => typeof nutrition[key] === "number");

  // The adapted lines carry the replacement text verbatim, so this is enough
  // to light up the ones that changed without matching on anything fuzzy.
  const replaced = new Set(
    result.changes
      .map((swap) => swap.replacement?.trim().toLowerCase())
      .filter(Boolean)
  );

  // Two in the clear is enough to show the work; the rest is what the app is
  // for. Below three there is nothing worth teasing, so they all show.
  const VISIBLE_SWAPS = 2;
  const showAll = result.changes.length <= VISIBLE_SWAPS + 1;
  const shown = showAll ? result.changes : result.changes.slice(0, VISIBLE_SWAPS);
  const locked = showAll ? [] : result.changes.slice(VISIBLE_SWAPS);

  const meta = [
    source?.servings ? `Serves ${source.servings}` : null,
    source?.cook_time_minutes ? `${source.cook_time_minutes} min` : null,
    preview?.host ?? null,
  ].filter(Boolean) as string[];

  return (
    <motion.article
      className="recipe"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="recipe-hero" variants={rise}>
        {hero ? (
          <motion.img
            src={hero}
            alt=""
            initial={still ? undefined : { scale: 1.14 }}
            animate={still ? undefined : { scale: 1 }}
            transition={{ duration: 1.9, ease: EASE }}
          />
        ) : (
          <span className="recipe-hero-empty">
            <UtensilsCrossed size={40} strokeWidth={1.4} aria-hidden="true" />
          </span>
        )}
        <span className="recipe-chip">
          Adapted for {result.diet === "None" ? "you" : result.diet}
        </span>
      </motion.div>

      <motion.h3 className="recipe-title" variants={rise}>
        {recipe.title ?? "Your adapted recipe"}
      </motion.h3>

      {meta.length > 0 && (
        <motion.p className="recipe-meta" variants={rise}>
          {source?.servings && (
            <span>
              <Users size={13.5} strokeWidth={2.1} aria-hidden="true" />
              Serves {source.servings}
            </span>
          )}
          {source?.cook_time_minutes && (
            <span>
              <Clock3 size={13.5} strokeWidth={2.1} aria-hidden="true" />
              {source.cook_time_minutes} min
            </span>
          )}
          {preview?.host && <span>{preview.host}</span>}
        </motion.p>
      )}

      {result.assessment && (
        <motion.p className="recipe-lead" variants={rise}>
          {result.assessment}
        </motion.p>
      )}

      {/* Nutrition leads, because the number that changed is the thing people
          came to know, and the adapted figure is the one the app holds. */}
      <motion.section className="nutri" variants={rise}>
        <div className="nutri-head">
          <h4>Nutrition per serving</h4>
          <span className="nutri-chip">
            <Lock size={12} strokeWidth={2.6} aria-hidden="true" />
            Adapted values in the app
          </span>
        </div>

        <div className="nutri-grid">
          {MACROS.map(({ key, label, unit }, i) => {
            const was = nutrition?.[key];
            return (
              <motion.div
                className="nutri-cell"
                key={key}
                initial={still ? undefined : { opacity: 0, y: 14 }}
                animate={still ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: EASE }}
              >
                <span className="nutri-name">{label}</span>
                <span className="nutri-was">
                  {typeof was === "number" ? `${was}${unit}` : "--"}
                </span>
                <span className="nutri-rule" aria-hidden="true" />
                <span className="nutri-now" aria-hidden="true" />
              </motion.div>
            );
          })}
        </div>

        <p className="nutri-foot">
          {hasNumbers
            ? "That is the original. See what your swaps did to every number."
            : "See the calories, protein, carbs and fat for the version you just made."}
        </p>
      </motion.section>

      <motion.div className="recipe-actions" variants={rise}>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary recipe-action"
        >
          {shared ? (
            <Smartphone size={17} strokeWidth={2.2} aria-hidden="true" />
          ) : (
            <BookmarkPlus size={17} strokeWidth={2.2} aria-hidden="true" />
          )}
          {shared ? "Get Plateful free" : "Save adapted recipe"}
        </a>
        <a
          href={shared ? "/convert" : PLAY_STORE_URL}
          {...(shared ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          className="btn btn-ghost recipe-action"
        >
          <RefreshCw size={16} strokeWidth={2.2} aria-hidden="true" />
          {shared ? "Remix your own recipe" : "Convert new recipe"}
        </a>
      </motion.div>

      <motion.p className="recipe-actions-note" variants={rise}>
        {shared
          ? "Your first remix is free. No card, no app needed to try it."
          : "That was your one free conversion. Plateful converts every recipe you save, and keeps them all in one place."}
      </motion.p>

      {/* Every button above goes to Google Play, so without this an iPhone
          reaches the end of the funnel and finds nothing it can install. */}
      <motion.p className="recipe-ios" variants={rise}>
        <button type="button" onClick={() => setWaitlist(true)} aria-haspopup="dialog">
          <AppleIcon size={14} fill="currentColor" />
          <span>On iPhone? Plateful is Android only for now.</span>
          <span className="recipe-ios-cta">Join the waitlist</span>
        </button>
      </motion.p>

      <WaitlistModal open={waitlist} onClose={() => setWaitlist(false)} />

      {!shared && result.remixId && (
        <motion.div className="share" variants={rise}>
          <div className="share-text">
            <h4>Share this remix</h4>
            <p>Anyone with the link sees the {dietWord} version you just made.</p>
          </div>
          <button
            type="button"
            className={copied ? "share-btn is-copied" : "share-btn"}
            onClick={() => {
              const url = `${window.location.origin}/r/${result.remixId}`;
              void navigator.clipboard?.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2200);
              });
            }}
          >
            {copied ? (
              <Check size={15} strokeWidth={2.6} aria-hidden="true" />
            ) : (
              <Link2 size={15} strokeWidth={2.2} aria-hidden="true" />
            )}
            {copied ? "Link copied" : "Copy link"}
          </button>
        </motion.div>
      )}

      {result.changes.length > 0 && (
        <motion.section className="swaps" variants={rise}>
          <h4>
            What changed
            <span className="swaps-count">{result.changes.length} swaps</span>
          </h4>

          <div className="swap-list">
            {shown.map((swap, i) => (
              <motion.div
                className="swap"
                key={`${swap.original}-${i}`}
                initial={still ? undefined : { opacity: 0, y: 18 }}
                animate={still ? undefined : { opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: 0.12 + i * 0.06,
                  ease: EASE,
                }}
              >
                <p className="swap-row">
                  <span className="swap-from">{swap.original}</span>
                  <span className="swap-arrow" aria-hidden="true">
                    <ArrowRight size={12} strokeWidth={2.8} />
                  </span>
                  <span className="swap-to">{swap.replacement}</span>
                </p>
                {swap.reason && <p className="swap-why">{swap.reason}</p>}
              </motion.div>
            ))}
          </div>

          {locked.length > 0 && (
            <motion.div
              className="swaps-locked"
              initial={still ? undefined : { opacity: 0 }}
              animate={still ? undefined : { opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.34, ease: EASE }}
            >
              <div className="swap-list" aria-hidden="true">
                {locked.map((swap, i) => (
                  <div className="swap" key={`locked-${i}`}>
                    <p className="swap-row">
                      <span className="swap-from">{swap.original}</span>
                      <span className="swap-arrow">
                        <ArrowRight size={12} strokeWidth={2.8} />
                      </span>
                      <span className="swap-to">{swap.replacement}</span>
                    </p>
                    {swap.reason && <p className="swap-why">{swap.reason}</p>}
                  </div>
                ))}
              </div>

              <div className="swaps-veil">
                <span className="swaps-veil-chip">
                  <Lock size={12} strokeWidth={2.6} aria-hidden="true" />
                  {locked.length} more {locked.length === 1 ? "swap" : "swaps"}
                </span>
                <p>
                  Every other swap, and the reason behind each one, in the app.
                </p>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary swaps-veil-btn"
                >
                  <Sparkles size={16} strokeWidth={2.2} aria-hidden="true" />
                  See every swap
                </a>
              </div>
            </motion.div>
          )}
        </motion.section>
      )}

      {/* Enough of the list and the method to prove the rewrite is real, and
          not enough to shop from or cook from. That is the trade the page is
          making, so it is one gate across both columns rather than two. */}
      <motion.div className="recipe-body" variants={rise}>
        <div className="body-veil">
          <span className="body-veil-chip">
            <Lock size={12} strokeWidth={2.6} aria-hidden="true" />
            Full recipe
          </span>
          <p>
            {shared
              ? `The rest of the ingredients and every step of the ${dietWord} version, in the app.`
              : "The rest of the ingredients and every step, ready to cook from, in the app."}
          </p>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary body-veil-btn"
          >
            <Smartphone size={16} strokeWidth={2.2} aria-hidden="true" />
            Open in Plateful
          </a>
        </div>
        <section>
          <h4>Ingredients</h4>
          <ul className="ing">
            {(recipe.ingredients ?? []).map((item, i) => {
              const Mark = iconForIngredient(item.name);
              const swapped = replaced.has((item.name ?? "").trim().toLowerCase());
              return (
                <li
                  key={`${item.name}-${i}`}
                  className={swapped ? "ing-row is-swapped" : "ing-row"}
                >
                  <span className="ing-icon">
                    <Mark size={14} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <p className="ing-text">
                    {formatAmount(item) && (
                      <span className="ing-qty">{formatAmount(item)}</span>
                    )}
                    {item.name}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <h4>Method</h4>
          <ol className="steps">
            {(recipe.steps ?? []).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      </motion.div>

      {result.warnings.length > 0 && (
        <motion.div className="recipe-warnings" variants={rise}>
          {result.warnings.map((warning, i) => (
            <p key={i}>
              <TriangleAlert size={15} aria-hidden="true" />
              {warning}
            </p>
          ))}
        </motion.div>
      )}

      <motion.div
        className="recipe-bar"
        initial={still ? { opacity: 0 } : { y: 90 }}
        animate={still ? { opacity: 1 } : { y: 0 }}
        transition={{ duration: 0.7, delay: 1.1, ease: EASE }}
      >
        <span className="recipe-bar-mark" aria-hidden="true">
          {/* Always in view, so never lazy. */}
          <Image
            src="/play_store_512.png"
            alt=""
            width={40}
            height={40}
            loading="eager"
          />
        </span>

        <p>
          <strong>
            {shared
              ? result.diet === "None"
                ? "Curious what your own recipes could look like?"
                : `Curious what your recipes look like ${dietWord}?`
              : (recipe.title ?? "Your adapted recipe")}
          </strong>
          <span>
            {shared
              ? "Remix any recipe you save. The first one is free."
              : "Cook it, save it, and convert every recipe after this one."}
          </span>
        </p>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary on-dark recipe-bar-btn"
        >
          Get Plateful free
        </a>
      </motion.div>
    </motion.article>
  );
}
