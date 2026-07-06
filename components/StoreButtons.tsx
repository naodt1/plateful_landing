import { AppleIcon, PlayIcon } from "./icons";

export function StoreButtons({ center = false }: { center?: boolean }) {
  return (
    <div className={center ? "store-buttons center" : "store-buttons"}>
      <a
        href="https://apps.apple.com/app/plateful"
        target="_blank"
        rel="noopener noreferrer"
        className="store-btn"
        aria-label="Download Plateful on the App Store"
      >
        <AppleIcon />
        <span className="store-btn-text">
          <span className="small">Download on the</span>
          <span className="big">App Store</span>
        </span>
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=com.plateful"
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
  );
}
