"use client";

import {
  ArrowRight,
  Clock3,
  Lock,
  RefreshCw,
  BookmarkPlus,
  TriangleAlert,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { PLAY_STORE_URL } from "@/lib/site";
import type { LinkPreview } from "@/components/RecipeLinkCard";

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
}: {
  result: ConvertResponse;
  preview: LinkPreview | null;
}) {
  const still = useReducedMotion();

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
            ? "Top figures are the original recipe. Plateful works out what your swaps did to each one."
            : "Plateful works out the calories, protein, carbs and fat for the version you just made."}
        </p>
      </motion.section>

      <motion.div className="recipe-actions" variants={rise}>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary recipe-action"
        >
          <BookmarkPlus size={17} strokeWidth={2.2} aria-hidden="true" />
          Save adapted recipe
        </a>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost recipe-action"
        >
          <RefreshCw size={16} strokeWidth={2.2} aria-hidden="true" />
          Convert new recipe
        </a>
      </motion.div>

      <motion.p className="recipe-actions-note" variants={rise}>
        That was your free conversion. The app keeps every recipe you adapt and
        converts as many as you like.
      </motion.p>

      {result.changes.length > 0 && (
        <motion.section className="swaps" variants={rise}>
          <h4>What changed</h4>
          <div className="swap-list">
            {result.changes.map((swap, i) => (
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
        </motion.section>
      )}

      <motion.div className="recipe-body" variants={rise}>
        <section>
          <h4>Ingredients</h4>
          <ul className="ing">
            {(recipe.ingredients ?? []).map((item, i) => (
              <li key={`${item.name}-${i}`}>
                <span className="ing-qty">{formatAmount(item)}</span>
                <span className="ing-name">{item.name}</span>
              </li>
            ))}
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
    </motion.article>
  );
}
