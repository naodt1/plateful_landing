import { ImageResponse } from "next/og";

export const alt = "Plateful: Any Recipe, Your Way";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#16412e",
          color: "#f4f0e8",
        }}
      >
        <svg
          width="160"
          height="160"
          viewBox="0 0 512 512"
          style={{ marginBottom: 32, borderRadius: 36 }}
        >
          <rect width="512" height="512" fill="#2E7D5B" />
          <path
            d="M214 166 C214 96 298 96 298 166"
            stroke="#B9E8BE"
            strokeWidth="17"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M172 262 C128 258 96 238 88 214 C82 194 100 182 112 194 C124 206 108 224 92 238 C74 254 64 296 68 342"
            stroke="#B9E8BE"
            strokeWidth="15"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M340 262 C384 258 414 240 424 218 C430 200 414 188 402 198 C390 210 402 226 420 232 C444 240 452 196 446 120"
            stroke="#B9E8BE"
            strokeWidth="15"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M170 302 L170 240 C170 200 176 172 206 164 C222 159 238 157 256 157 C274 157 290 159 306 164 C336 172 342 200 342 240 L342 302 Z"
            fill="#B9E8BE"
          />
          <g fill="none" stroke="#F49B2D" strokeLinecap="round">
            <ellipse cx="250" cy="222" rx="26" ry="48" strokeWidth="10" />
            <ellipse cx="250" cy="222" rx="10" ry="48" strokeWidth="9" />
            <line x1="250" y1="272" x2="250" y2="322" strokeWidth="17" />
          </g>
          <g transform="rotate(12 330 240)">
            <rect x="312" y="150" width="38" height="175" rx="19" fill="#F49B2D" />
            <rect x="323" y="110" width="16" height="52" rx="8" fill="#F49B2D" />
          </g>
          <rect x="150" y="298" width="212" height="118" rx="16" fill="#14301F" />
        </svg>
        <div
          style={{
            fontSize: 96,
            fontFamily: "Georgia, serif",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: 18,
          }}
        >
          Plateful
        </div>
        <div style={{ fontSize: 38, color: "#c8d6cc" }}>
          Any recipe, your way.
        </div>
      </div>
    ),
    size
  );
}
