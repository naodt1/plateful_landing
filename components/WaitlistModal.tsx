"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function WaitlistModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setSubmitted(false);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.21, 0.65, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={onClose}
            >
              ×
            </button>

            {!submitted ? (
              <>
                <div className="modal-badge">🍎 Coming soon</div>
                <h3 id="waitlist-title" className="modal-title">
                  Plateful is coming to iPhone
                </h3>
                <p className="modal-body">
                  We&apos;re polishing the iOS app now. Drop your email and
                  we&apos;ll let you know the moment it lands on the App
                  Store.
                </p>
                <form
                  className="modal-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="modal-input"
                    aria-label="Email address"
                  />
                  <button type="submit" className="modal-submit">
                    Join the waitlist
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="modal-badge">✓ You&apos;re on the list</div>
                <h3 id="waitlist-title" className="modal-title">
                  Thanks, we&apos;ll be in touch
                </h3>
                <p className="modal-body">
                  We&apos;ll email {email} as soon as Plateful is live on the
                  App Store. In the meantime, it&apos;s live now on Google
                  Play.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
