"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

import { RecipeLinkCard, type LinkPreview } from "@/components/RecipeLinkCard";

export type ProgressPhase = "reading" | "converting";

/**
 * Steps are written to match what the server is genuinely doing at that
 * moment, so the wait explains itself instead of just spinning.
 */
function stepsFor(phase: ProgressPhase, diet: string): string[] {
  if (phase === "reading") {
    return ["Opening the link", "Finding the recipe on the page"];
  }
  const target = diet === "None" ? "your plate" : diet.toLowerCase();
  return [
    "Reading the full ingredient list",
    `Finding swaps that fit ${target}`,
    "Rewriting the steps around them",
    "Checking the recipe still works",
  ];
}

/** Roughly how long each step tends to take, in milliseconds. */
function pacingFor(phase: ProgressPhase): number[] {
  return phase === "reading" ? [1100, 1600] : [3200, 5000, 5200, 6000];
}

export function ConvertProgress({
  phase,
  diet,
  preview,
  complete = false,
}: {
  phase: ProgressPhase;
  diet: string;
  preview: LinkPreview | null;
  /** The work is done: tick every remaining step before the panel gives way. */
  complete?: boolean;
}) {
  const steps = stepsFor(phase, diet);
  const pacing = pacingFor(phase);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    // The last step has no timer: it holds until the real request lands, so
    // the list never claims to be finished before the work is.
    for (let i = 0; i < steps.length - 1; i++) {
      elapsed += pacing[i] ?? 3000;
      timers.push(setTimeout(() => setActive(i + 1), elapsed));
    }
    return () => timers.forEach(clearTimeout);
    // Restarting on phase change is the point; the step text is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, diet]);

  const total = pacing.slice(0, steps.length).reduce((sum, ms) => sum + ms, 0);
  const reached = complete ? steps.length : active;

  return (
    <motion.div
      className={complete ? "progress-panel is-complete" : "progress-panel"}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.21, 0.65, 0.36, 1] }}
      aria-live="polite"
    >
      <div className="progress-pan" aria-hidden="true">
        {complete ? (
          <motion.span
            className="progress-pan-done"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.21, 0.65, 0.36, 1] }}
          >
            <Check size={26} strokeWidth={3} />
          </motion.span>
        ) : (
          <>
            <span className="progress-pan-ring" />
            <span className="progress-pan-ring delay" />
            <span className="progress-pan-core" />
          </>
        )}
      </div>

      <p className="progress-head">
        {complete
          ? "Your recipe is ready"
          : phase === "reading"
            ? "Reading your link"
            : "Converting your recipe"}
      </p>

      {preview && (
        <div className="progress-preview">
          <RecipeLinkCard preview={preview} />
        </div>
      )}

      <ul className="progress-steps">
        {steps.map((step, i) => (
          <li
            key={step}
            className={
              i < reached ? "is-done" : i === reached ? "is-active" : "is-waiting"
            }
          >
            <span className="progress-mark">
              <AnimatePresence mode="wait" initial={false}>
                {i < reached ? (
                  <motion.span
                    key="done"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check size={13} strokeWidth={3} aria-hidden="true" />
                  </motion.span>
                ) : i === reached ? (
                  <motion.span
                    key="active"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Loader2 size={13} className="spin" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span key="wait" className="progress-dot" />
                )}
              </AnimatePresence>
            </span>
            {step}
          </li>
        ))}
      </ul>

      <div className="progress-bar">
        {/* Creeps toward the end rather than reaching it, because only the
            response knows when this is actually done. */}
        <motion.span
          initial={{ width: "6%" }}
          animate={{ width: complete ? "100%" : "94%" }}
          transition={
            complete
              ? { duration: 0.4, ease: "easeOut" }
              : { duration: total / 1000, ease: "easeOut" }
          }
        />
      </div>
    </motion.div>
  );
}
