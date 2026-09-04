"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Beef,
  Carrot,
  Check,
  ChevronDown,
  Drumstick,
  MoonStar,
  Sprout,
  Utensils,
  WheatOff,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type Diet = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export const DIETS: Diet[] = [
  { value: "None", label: "No restrictions", icon: Utensils },
  { value: "Vegan", label: "Vegan", icon: Sprout },
  { value: "Vegetarian", label: "Vegetarian", icon: Carrot },
  { value: "Keto", label: "Keto", icon: Beef },
  { value: "Paleo", label: "Paleo", icon: Drumstick },
  { value: "Gluten-Free", label: "Gluten free", icon: WheatOff },
  { value: "Halal", label: "Halal", icon: MoonStar },
];

/**
 * A listbox rather than a native select, because the whole point is that each
 * diet carries its own mark: a native option list cannot show one. Everything
 * a select gives you for free is therefore rebuilt here, keyboard included.
 */
export function DietPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();

  const index = Math.max(
    0,
    DIETS.findIndex((diet) => diet.value === value)
  );
  const current = DIETS[index];
  const Icon = current.icon;

  useEffect(() => {
    if (!open) return;
    setCursor(index);

    function onPointerDown(event: MouseEvent) {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
    // The cursor should start on the selection each time it opens, not follow it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Moving focus into the list is what makes arrow keys and type-ahead land
  // somewhere sensible, and what returns focus to the trigger on Escape.
  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
    (wrap.current?.querySelector("button") as HTMLButtonElement)?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setCursor((c) => Math.min(DIETS.length - 1, c + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
        break;
      case "Home":
        event.preventDefault();
        setCursor(0);
        break;
      case "End":
        event.preventDefault();
        setCursor(DIETS.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(DIETS[cursor].value);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div className="diet" ref={wrap}>
      <button
        type="button"
        className={open ? "diet-trigger is-open" : "diet-trigger"}
        onClick={() => setOpen((was) => !was)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
      >
        <span className="diet-mark">
          <Icon size={15} strokeWidth={2.1} aria-hidden="true" />
        </span>
        <span className="diet-value">{current.label}</span>
        <ChevronDown
          size={16}
          strokeWidth={2.4}
          className="diet-caret"
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            className="diet-list"
            role="listbox"
            tabIndex={-1}
            ref={list}
            aria-activedescendant={`${listId}-${cursor}`}
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {DIETS.map((diet, i) => {
              const Mark = diet.icon;
              const selected = diet.value === value;
              return (
                <li
                  key={diet.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={selected}
                  className={[
                    "diet-option",
                    selected ? "is-selected" : "",
                    i === cursor ? "is-cursor" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => choose(diet.value)}
                >
                  <span className="diet-mark">
                    <Mark size={15} strokeWidth={2.1} aria-hidden="true" />
                  </span>
                  {diet.label}
                  {selected && (
                    <Check
                      size={15}
                      strokeWidth={2.6}
                      className="diet-tick"
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
