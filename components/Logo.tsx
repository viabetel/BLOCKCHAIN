/**
 * Limero mark — minimalist lime-slice geometry.
 *
 * Concept: a circle split by radial lines suggesting citrus segments.
 * Inspired by the discipline of Arbitrum / Ethena / Lido marks:
 * - single color (lime)
 * - geometric precision
 * - works at any size
 * - no gradient, no shine, no emoji
 */
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Outer circle */}
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
      />
      {/* Inner smaller circle - creates the "peel" effect */}
      <circle
        cx="16"
        cy="16"
        r="9.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity="0.55"
      />
      {/* Center dot */}
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
      {/* Segment lines - 6 radial strokes (like a sliced lime) */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 16 + Math.cos(rad) * 2.2;
        const y1 = 16 + Math.sin(rad) * 2.2;
        const x2 = 16 + Math.cos(rad) * 9;
        const y2 = 16 + Math.sin(rad) * 9;
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.65"
          />
        );
      })}
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display font-bold ${className}`}
      style={{
        letterSpacing: "-0.04em",
        fontFamily: "var(--font-display)",
      }}
    >
      Limero
    </span>
  );
}
