"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Link2,
  Loader2,
  LogOut,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

import { auth, googleProvider } from "@/lib/firebase";
import { StoreButtons } from "@/components/StoreButtons";
import { ConvertProgress, type ProgressPhase } from "@/components/ConvertProgress";
import { RecipeLinkCard, type LinkPreview } from "@/components/RecipeLinkCard";
import { GoogleIcon } from "@/components/icons";

const DIETS = [
  "None",
  "Vegan",
  "Vegetarian",
  "Keto",
  "Paleo",
  "Gluten-Free",
  "Halal",
];

type Ingredient = { name?: string; amount?: number; unit?: string };
type Recipe = {
  title?: string;
  description?: string;
  ingredients?: Ingredient[];
  steps?: string[];
};
type Swap = {
  original: string;
  replacement: string;
  reason?: string;
};
type ConvertResponse = {
  tailored: Recipe;
  changes: Swap[];
  assessment: string | null;
  warnings: string[];
  diet: string;
};

/** Turns Firebase's error codes into something a person can act on. */
function authMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/missing-password":
      return "Enter your password.";
    case "auth/weak-password":
      return "Use at least 6 characters for your password.";
    case "auth/email-already-in-use":
      return "That email already has an account. Try signing in instead.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password isn't right.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a minute and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/unauthorized-domain":
      return "This domain isn't authorized for sign-in yet.";
    default:
      return "Could not sign you in. Please try again.";
  }
}

/** Loose enough to fire while typing, strict enough not to fetch nonsense. */
function looksLikeUrl(value: string): boolean {
  return /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(value);
}

function formatAmount(item: Ingredient): string {
  const amount =
    typeof item.amount === "number" && Number.isFinite(item.amount)
      ? // trim 1.0 to 1, keep 0.5
        String(Number(item.amount.toFixed(2))).replace(/\.00$/, "")
      : "";
  return [amount, item.unit].filter(Boolean).join(" ").trim();
}

export function ConvertTool() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [url, setUrl] = useState("");
  const [diet, setDiet] = useState("Vegetarian");

  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // null while idle; otherwise the stage the progress animation is showing.
  const [phase, setPhase] = useState<ProgressPhase | null>(null);
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedUp, setUsedUp] = useState(false);

  // Set when someone hits Convert while signed out, so the conversion can
  // resume by itself the moment auth completes.
  const pendingRef = useRef(false);
  // Guards against a slow preview for an old link landing after a newer one.
  const previewSeq = useRef(0);

  useEffect(() => {
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setAuthReady(true);
    });
  }, []);

  const loadPreview = useCallback(
    async (target: string): Promise<LinkPreview | null> => {
      const seq = ++previewSeq.current;
      setPreviewing(true);
      try {
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target }),
        });
        const data = await response.json();
        if (seq !== previewSeq.current) return null;
        if (!response.ok) {
          setPreview(null);
          return null;
        }
        setPreview(data as LinkPreview);
        return data as LinkPreview;
      } catch {
        if (seq === previewSeq.current) setPreview(null);
        return null;
      } finally {
        if (seq === previewSeq.current) setPreviewing(false);
      }
    },
    []
  );

  // Show the card as soon as a link is in the box, not after Convert. The
  // debounce keeps a half-typed URL from being fetched a dozen times.
  useEffect(() => {
    const target = url.trim();
    // Drop the old card the moment the link changes. Leaving it up would show
    // one recipe while the box holds a different one, and handleSubmit would
    // then treat that stale card as the link it had already read.
    previewSeq.current += 1;
    setPreview(null);
    setPreviewing(false);

    if (!looksLikeUrl(target)) return;

    const timer = setTimeout(() => void loadPreview(target), 550);
    return () => clearTimeout(timer);
  }, [url, loadPreview]);

  async function runConversion(current: User) {
    setPhase("converting");
    setError(null);
    setUsedUp(false);

    try {
      const idToken = await current.getIdToken();
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, diet, idToken }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.error === "free_conversion_used") {
          setUsedUp(true);
        } else {
          setError(data.error ?? "Something went wrong.");
        }
        return;
      }
      setResult(data as ConvertResponse);
    } catch {
      setError("Could not reach the recipe service. Please try again.");
    } finally {
      setPhase(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const target = url.trim();
    if (!target) return;

    setResult(null);
    setError(null);
    setUsedUp(false);

    // Reading the page is the cheap half of the job, so it happens before the
    // gate: the wait is real, and it is what fills in the card below.
    if (!preview) {
      setPhase("reading");
      await loadPreview(target);
    }

    if (user) {
      await runConversion(user);
      return;
    }

    // A link we could not preview still gets converted; plenty of sites hand
    // a stub to anything that isn't a browser.
    setPhase(null);
    pendingRef.current = true;
    setShowAuth(true);
  }

  async function handleAuth(event: React.FormEvent) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError(null);

    try {
      const credential =
        mode === "signup"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);

      setShowAuth(false);
      if (pendingRef.current) {
        pendingRef.current = false;
        await runConversion(credential.user);
      }
    } catch (err) {
      const code =
        typeof err === "object" && err && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      setAuthError(authMessage(code));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleGoogle() {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      setShowAuth(false);
      if (pendingRef.current) {
        pendingRef.current = false;
        await runConversion(credential.user);
      }
    } catch (err) {
      const code =
        typeof err === "object" && err && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      setAuthError(authMessage(code));
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <div className="convert">
      <form className="convert-form" onSubmit={handleSubmit}>
        <label className="convert-field">
          <span className="convert-label">Recipe link</span>
          <span className="convert-input-wrap">
            <Link2 size={17} strokeWidth={2} aria-hidden="true" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a TikTok, YouTube, or recipe website link"
              className="convert-input"
              required
            />
          </span>
        </label>

        <label className="convert-field convert-field-diet">
          <span className="convert-label">Convert to</span>
          <select
            className="convert-select"
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
          >
            {DIETS.map((option) => (
              <option key={option} value={option}>
                {option === "None" ? "No restrictions" : option}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="btn btn-primary btn-lg convert-submit"
          disabled={phase !== null || !authReady}
        >
          {phase !== null ? (
            <>
              <Loader2 size={18} className="spin" aria-hidden="true" />
              {phase === "reading" ? "Reading link" : "Converting"}
            </>
          ) : (
            <>
              Convert recipe
              <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {/* The pasted link, shown as its own card. While the run is in flight the
          progress panel owns the card instead, so they never double up. */}
      <AnimatePresence>
        {phase === null && (previewing || preview) && (
          <motion.div
            key="linkcard"
            className="convert-linkcard"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <RecipeLinkCard preview={preview} loading={previewing && !preview} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase !== null && (
          <ConvertProgress
            key={phase}
            phase={phase}
            diet={diet}
            preview={preview}
          />
        )}
      </AnimatePresence>

      <p className="convert-note">
        {user ? (
          <>
            Signed in as {user.email ?? "your account"}.{" "}
            <button
              type="button"
              className="convert-linkbtn"
              onClick={() => signOut(auth)}
            >
              <LogOut size={13} aria-hidden="true" />
              Sign out
            </button>
          </>
        ) : (
          "One free conversion. You'll sign in to see the result."
        )}
      </p>

      {error && (
        <p className="convert-error">
          <TriangleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      {usedUp && (
        <div className="convert-used">
          <h3>You&apos;ve used your free conversion</h3>
          <p>
            Get the app to convert every recipe you save, adjust servings, and
            build grocery lists automatically.
          </p>
          <StoreButtons center onDark />
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            className="convert-result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.65, 0.36, 1] }}
          >
            <span className="convert-badge">
              <Sparkles size={14} aria-hidden="true" />
              Converted for {result.diet === "None" ? "you" : result.diet}
            </span>
            <h3 className="convert-title">
              {result.tailored.title ?? "Your converted recipe"}
            </h3>
            {result.assessment && (
              <p className="convert-assessment">{result.assessment}</p>
            )}

            {result.changes.length > 0 && (
              <div className="convert-swaps">
                <h4>What changed</h4>
                <ul>
                  {result.changes.map((swap, i) => (
                    <li key={`${swap.original}-${i}`}>
                      <span className="swap-line">
                        <s>{swap.original}</s>
                        <ArrowRight size={13} aria-hidden="true" />
                        <b>{swap.replacement}</b>
                      </span>
                      {swap.reason && <span className="swap-why">{swap.reason}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="convert-cols">
              <div>
                <h4>Ingredients</h4>
                <ul className="convert-list">
                  {(result.tailored.ingredients ?? []).map((item, i) => (
                    <li key={`${item.name}-${i}`}>
                      <span className="qty">{formatAmount(item)}</span>
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Steps</h4>
                <ol className="convert-steps">
                  {(result.tailored.steps ?? []).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div className="convert-warnings">
                {result.warnings.map((warning, i) => (
                  <p key={i}>
                    <TriangleAlert size={15} aria-hidden="true" />
                    {warning}
                  </p>
                ))}
              </div>
            )}

            <div className="convert-after">
              <h4>That was your free one</h4>
              <p>
                Plateful does this for every recipe you save, and remembers
                your diet so you never have to pick it again.
              </p>
              <StoreButtons center onDark />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuth && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowAuth(false)}
          >
            <motion.div
              className="modal-card auth-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-title"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.21, 0.65, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="auth-logo">
                <Image
                  src="/play_store_512.png"
                  alt="Plateful"
                  width={54}
                  height={54}
                  priority
                />
              </span>

              <h3 id="auth-title" className="modal-title">
                {preview ? "We found your recipe" : "Your recipe is ready"}
              </h3>
              <p className="modal-body">
                Create your free Plateful account to see the{" "}
                {diet === "None" ? "converted" : diet.toLowerCase()} version.
                The same account works in the app.
              </p>

              {preview && (
                <div className="auth-preview">
                  <RecipeLinkCard preview={preview} />
                </div>
              )}

              <form className="modal-form" onSubmit={handleAuth}>
                <input
                  type="email"
                  className="modal-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                  required
                />
                <input
                  type="password"
                  className="modal-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="Password"
                  required
                />
                {authError && <p className="modal-error">{authError}</p>}
                <button
                  type="submit"
                  className="modal-submit"
                  disabled={authBusy}
                >
                  {authBusy
                    ? "Just a moment..."
                    : mode === "signup"
                      ? "Create account and convert"
                      : "Sign in and convert"}
                </button>
              </form>

              <div className="auth-or">
                <span>or</span>
              </div>

              <button
                type="button"
                className="btn btn-ghost auth-google"
                onClick={handleGoogle}
                disabled={authBusy}
              >
                <GoogleIcon size={18} />
                Continue with Google
              </button>

              <p className="auth-switch">
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => setMode("signin")}>
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    New to Plateful?{" "}
                    <button type="button" onClick={() => setMode("signup")}>
                      Create an account
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
