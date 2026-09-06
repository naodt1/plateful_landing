"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { AppleIcon, PlayIcon } from "@/components/icons";
import { WaitlistModal } from "@/components/WaitlistModal";
import { PLAY_STORE_URL } from "@/lib/site";

/**
 * The compact version of the homepage's platform section, for the pages where
 * the app is the next step. Says which phone this runs on before someone
 * spends their free conversion finding out.
 */
export function PlatformNote() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <>
      <aside className="platnote">
        <div className="platnote-row">
          <span className="platnote-icon">
            <PlayIcon />
          </span>
          <p>
            <strong>Android</strong>
            <span className="platnote-live">
              <Check size={12} strokeWidth={3.2} aria-hidden="true" />
              Available now
            </span>
          </p>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="platnote-btn"
          >
            Get the app
          </a>
        </div>

        <div className="platnote-row">
          <span className="platnote-icon">
            <AppleIcon size={19} fill="currentColor" />
          </span>
          <p>
            <strong>iPhone and iPad</strong>
            <span>Coming soon</span>
          </p>
          <button
            type="button"
            className="platnote-btn is-ghost"
            aria-haspopup="dialog"
            onClick={() => setWaitlistOpen(true)}
          >
            Join the waitlist
          </button>
        </div>
      </aside>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </>
  );
}
