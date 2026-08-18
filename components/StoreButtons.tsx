"use client";

import { useState } from "react";
import { AppleIcon, PlayIcon } from "./icons";
import { WaitlistModal } from "./WaitlistModal";
import { PLAY_STORE_URL } from "@/lib/site";

export function StoreButtons({
  center = false,
  onDark = false,
}: {
  center?: boolean;
  onDark?: boolean;
}) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <>
      <div className={center ? "cta-group center" : "cta-group"}>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn btn-primary btn-lg${onDark ? " on-dark" : ""}`}
        >
          <PlayIcon />
          <span className="btn-stack">
            <span className="btn-sub">Get it on</span>
            <span>Google Play</span>
          </span>
        </a>

        <button
          type="button"
          className={`btn btn-ghost${onDark ? " on-dark" : ""}`}
          aria-haspopup="dialog"
          onClick={() => setWaitlistOpen(true)}
        >
          <AppleIcon size={17} fill="currentColor" />
          Coming soon on iOS
        </button>
      </div>

      <WaitlistModal
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
      />
    </>
  );
}
