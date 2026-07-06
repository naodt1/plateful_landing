"use client";

import { useState } from "react";
import { AppleIcon, PlayIcon } from "./icons";
import { WaitlistModal } from "./WaitlistModal";

export function StoreButtons({ center = false }: { center?: boolean }) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <>
      <div className={center ? "store-buttons center" : "store-buttons"}>
        <button
          type="button"
          className="store-btn"
          aria-haspopup="dialog"
          aria-label="Plateful on the App Store: coming soon, join the waitlist"
          onClick={() => setWaitlistOpen(true)}
        >
          <AppleIcon />
          <span className="store-btn-text">
            <span className="small">Coming soon on the</span>
            <span className="big">App Store</span>
          </span>
        </button>
        <a
          href="https://play.google.com/store/apps/details?id=com.naodtadele.plateful"
          target="_blank"
          rel="noopener noreferrer"
          className="store-btn"
          aria-label="Get Plateful on Google Play"
        >
          <PlayIcon />
          <span className="store-btn-text">
            <span className="small">GET IT ON</span>
            <span className="big">Google Play</span>
          </span>
        </a>
      </div>
      <WaitlistModal
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
      />
    </>
  );
}
