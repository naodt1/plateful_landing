import Image from "next/image";
import Link from "next/link";

import platefulLogo from "@/public/play_store_512.png";
import { PLAY_STORE_URL } from "@/lib/site";

export function SiteNav() {
  return (
    <nav className="container nav" aria-label="Main">
      <Link href="/" className="brand">
        <span className="brand-mark">
          <Image src={platefulLogo} alt="" width={38} height={38} priority />
        </span>
        <span className="brand-name">Plateful</span>
      </Link>
      <div className="nav-actions">
        <Link href="/convert" className="nav-link">
          Convert a recipe
        </Link>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Get the app
        </a>
      </div>
    </nav>
  );
}
