export function PlatefulLogo({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <rect width="512" height="512" fill="#2E7D5B" />
      {/* neck strap */}
      <path
        d="M214 166 C214 96 298 96 298 166"
        stroke="#B9E8BE"
        strokeWidth="17"
        fill="none"
        strokeLinecap="round"
      />
      {/* left waist tie */}
      <path
        d="M172 262 C128 258 96 238 88 214 C82 194 100 182 112 194 C124 206 108 224 92 238 C74 254 64 296 68 342"
        stroke="#B9E8BE"
        strokeWidth="15"
        fill="none"
        strokeLinecap="round"
      />
      {/* right waist tie */}
      <path
        d="M340 262 C384 258 414 240 424 218 C430 200 414 188 402 198 C390 210 402 226 420 232 C444 240 452 196 446 120"
        stroke="#B9E8BE"
        strokeWidth="15"
        fill="none"
        strokeLinecap="round"
      />
      {/* apron bib */}
      <path
        d="M170 302 L170 240 C170 200 176 172 206 164 C222 159 238 157 256 157 C274 157 290 159 306 164 C336 172 342 200 342 240 L342 302 Z"
        fill="#B9E8BE"
      />
      {/* whisk */}
      <g fill="none" stroke="#F49B2D" strokeLinecap="round">
        <ellipse cx="250" cy="222" rx="26" ry="48" strokeWidth="10" />
        <ellipse cx="250" cy="222" rx="10" ry="48" strokeWidth="9" />
        <line x1="250" y1="272" x2="250" y2="322" strokeWidth="17" />
      </g>
      {/* rolling pin */}
      <g transform="rotate(12 330 240)">
        <rect x="312" y="150" width="38" height="175" rx="19" fill="#F49B2D" />
        <rect x="323" y="110" width="16" height="52" rx="8" fill="#F49B2D" />
      </g>
      {/* pocket */}
      <rect x="150" y="298" width="212" height="118" rx="16" fill="#14301F" />
    </svg>
  );
}
