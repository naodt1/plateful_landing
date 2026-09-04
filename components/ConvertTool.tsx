"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Link2, Loader2, LogOut, TriangleAlert } from "lucide-react";
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
import {
  ConvertResult,
  type ConvertResponse,
} from "@/components/ConvertResult";
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

type Teaser = {
  title: string | null;
  changeCount: number;
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

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

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
  const [complete, setComplete] = useState(false);
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedUp, setUsedUp] = useState(false);

  // A finished conversion the server has sealed, waiting on an account to open
  // it. The page cannot read it, which is what keeps the gate meaningful.
  const [pending, setPending] = useState<{
    envelope: string;
    teaser: Teaser;
  } | null>(null);

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

  /** Lets every step finish ticking before the panel gives way. */
  async function finishAnimation() {
    setComplete(true);
    await wait(1200);
    setPhase(null);
    setComplete(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const target = url.trim();
    if (!target) return;

    setResult(null);
    setError(null);
    setUsedUp(false);
    setPending(null);

    // Reading the page is the cheap half of the job, so it runs first and
    // fills in the card below.
    if (!preview) {
      setPhase("reading");
      await loadPreview(target);
    }

    setPhase("converting");

    try {
      const idToken = user ? await user.getIdToken() : undefined;
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target, diet, idToken }),
        // Longer than the server's own budget, so a real answer always wins
        // the race and only a genuinely dead request trips this.
        signal: AbortSignal.timeout(70_000),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.error === "free_conversion_used") {
          setUsedUp(true);
        } else {
          setError(data.error ?? "Something went wrong.");
        }
        setPhase(null);
        return;
      }

      // Every checkmark lands before anything else happens on screen.
      await finishAnimation();

      if (data.revealed) {
        setResult(data.result as ConvertResponse);
        return;
      }

      setPending({ envelope: data.envelope, teaser: data.teaser as Teaser });
      setShowAuth(true);
    } catch (err) {
      const timedOut = err instanceof Error && err.name === "TimeoutError";
      setError(
        timedOut
          ? "That took longer than expected. Please try again."
          : "Could not reach the recipe service. Please try again."
      );
      setPhase(null);
    }
  }

  /** Opens the sealed result now that there is an account to book it against. */
  async function revealPending(current: User, envelope: string) {
    setError(null);
    setUsedUp(false);

    try {
      const idToken = await current.getIdToken();
      const response = await fetch("/api/convert/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envelope, idToken }),
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
      setResult(data.result as ConvertResponse);
      setPending(null);
    } catch {
      setError("Could not open your recipe. Please try again.");
    }
  }

  async function afterAuth(current: User) {
    setShowAuth(false);
    if (pending) await revealPending(current, pending.envelope);
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
      await afterAuth(credential.user);
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
      await afterAuth(credential.user);
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

  const busy = phase !== null;

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
          disabled={busy || !authReady}
        >
          {busy ? (
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
        {!busy && (previewing || preview) && (
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
            complete={complete}
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
          "One free conversion. No card needed."
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

      {/* Someone who signed in but has not opened their result yet. */}
      {pending && !result && !usedUp && (
        <div className="convert-reopen">
          <p>Your converted recipe is waiting.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAuth(true)}
          >
            Open it
          </button>
        </div>
      )}

      <AnimatePresence>
        {result && <ConvertResult result={result} preview={preview} />}
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
                {pending?.teaser.title
                  ? `${pending.teaser.title} is ready`
                  : "Your recipe is ready"}
              </h3>
              <p className="modal-body">
                {pending && pending.teaser.changeCount > 0 ? (
                  <>
                    We swapped {pending.teaser.changeCount}{" "}
                    {pending.teaser.changeCount === 1
                      ? "ingredient"
                      : "ingredients"}{" "}
                    for the{" "}
                    {pending.teaser.diet === "None"
                      ? "converted"
                      : pending.teaser.diet.toLowerCase()}{" "}
                    version. Create your free account to open it and keep it.
                  </>
                ) : (
                  <>
                    Create your free account to open it and keep it. The same
                    account works in the Plateful app.
                  </>
                )}
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
                      ? "Create account and open"
                      : "Sign in and open"}
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
