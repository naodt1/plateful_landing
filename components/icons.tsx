export function ForkIcon({ size = 21, strokeWidth = 1.8 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 3v7a3 3 0 0 0 3 3v8M7 3v6M10 3v6M20 3s-2 2-2 6 2 4 2 4v8"
        stroke="#fff"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppleIcon({
  size = 24,
  fill = "#fff",
}: {
  size?: number;
  fill?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
      <path d="M17.05 12.5c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.75 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.35 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.13 2.76-2.24.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.65zM14.79 5.6c.63-.77 1.06-1.83.94-2.9-.91.04-2.01.61-2.67 1.37-.59.68-1.1 1.76-.96 2.8 1.01.08 2.05-.51 2.69-1.27z" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg width="22" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1L13 12.1v-.2L3.7 2.2l-.1.1z" fill="#00d3ff" />
      <path d="M16.3 15.3 13 12.1v-.2l3.3-3.2.1.1 3.9 2.2c1.1.6 1.1 1.7 0 2.3l-3.9 2.2-.1-.2z" fill="#ffce00" />
      <path d="M16.4 15.2 13 12 3.6 21.7c.4.4 1 .4 1.7.1l11.1-6.6" fill="#ff3a44" />
      <path d="M16.4 8.8 5.3 2.2c-.7-.4-1.3-.3-1.7.1L13 12l3.4-3.2z" fill="#00e676" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" stroke="#1f7a53" strokeWidth="1.7" />
      <path
        d="M2.8 12h18.4M12 2.8c2.6 2.4 3.9 5.7 3.9 9.2s-1.3 6.8-3.9 9.2c-2.6-2.4-3.9-5.7-3.9-9.2s1.3-6.8 3.9-9.2z"
        stroke="#1f7a53"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function YouTubeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1.5" y="5" width="21" height="14" rx="4.5" fill="#FF0000" />
      <path d="M10 8.7l5.4 3.3L10 15.3z" fill="#fff" />
    </svg>
  );
}

export function TikTokIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M17.5 6.6a4.7 4.7 0 0 1-2.9-1v6.9a5.2 5.2 0 1 1-5.2-5.2c.2 0 .4 0 .6.03v2.7a2.6 2.6 0 1 0 1.8 2.5V2h2.7a4.7 4.7 0 0 0 3 4.6z"
        fill="#111"
      />
    </svg>
  );
}
