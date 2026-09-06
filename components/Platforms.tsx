"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { AppleIcon, PlayIcon } from "@/components/icons";
import { WaitlistModal } from "@/components/WaitlistModal";
import { PLAY_STORE_URL } from "@/lib/site";

/**
 * Says plainly which phone this runs on.
 *
 * Every install button on the site points at Google Play, so someone on an
 * iPhone otherwise finds that out by tapping one and landing somewhere they
 * cannot install from. Better to say it once, up front, and turn it into an
 * email address instead of a dead end.
 */
export function Platforms() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <>
      <div className="plat-grid">
        <div className="plat-card is-live">
          <span className="plat-icon">
            <PlayIcon />
          </span>
          <p className="plat-status">
            <Check size={13} strokeWidth={3} aria-hidden="true" />
            Available now
          </p>
          <h3>Android</h3>
          <p className="plat-body">
            Plateful is out on Google Play. Save your first recipe in the time
            it takes to paste a link.
          </p>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary plat-btn"
          >
            Get it on Google Play
          </a>
        </div>

        <div className="plat-card">
          <span className="plat-icon">
            <AppleIcon size={22} fill="currentColor" />
          </span>
          <p className="plat-status is-soon">Coming soon</p>
          <h3>iPhone and iPad</h3>
          <p className="plat-body">
            The iOS version is on the way. Leave your email and you will hear
            from us the day it lands, and not before.
          </p>
          <button
            type="button"
            className="btn btn-ghost plat-btn"
            aria-haspopup="dialog"
            onClick={() => setWaitlistOpen(true)}
          >
            Join the iOS waitlist
          </button>
        </div>
      </div>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </>
  );
}
