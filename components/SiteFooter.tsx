import Image from "next/image";
import Link from "next/link";

import platefulLogo from "@/public/play_store_512.png";
import { PLAY_STORE_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-brand">
            <span className="footer-mark">
              <Image src={platefulLogo} alt="" width={30} height={30} />
            </span>
            <span className="footer-name">Plateful</span>
          </div>
          <p className="footer-tagline">
            Save any recipe from TikTok, YouTube, or the web. Plateful adapts
            it to your diet automatically.
          </p>
        </div>

        <div>
          <p className="footer-heading">Product</p>
          <ul className="footer-links">
            <li>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                Get it on Google Play
              </a>
            </li>
            <li>
              <Link href="/#import-title">How it works</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="footer-heading">Legal</p>
          <ul className="footer-links">
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms of Service</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-note">
          © {new Date().getFullYear()} Plateful. Cook from anywhere.
        </span>
      </div>
    </footer>
  );
}
