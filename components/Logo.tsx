export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="limeBody" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0%" stopColor="#d9f99d" />
          <stop offset="40%" stopColor="#bef264" />
          <stop offset="75%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#65a30d" />
        </radialGradient>
        <radialGradient id="limeHighlight" cx="0.35" cy="0.3" r="0.35">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#65a30d" />
          <stop offset="100%" stopColor="#3f6212" />
        </linearGradient>
      </defs>

      {/* Lime body - slightly elongated oval like real lime */}
      <ellipse cx="20" cy="23" rx="14" ry="13" fill="url(#limeBody)" />

      {/* Outer rim darkening */}
      <ellipse cx="20" cy="23" rx="14" ry="13" fill="none" stroke="#4d7c0f" strokeWidth="0.8" opacity="0.4" />

      {/* Highlight / shine */}
      <ellipse cx="14" cy="17" rx="7" ry="5" fill="url(#limeHighlight)" />

      {/* Small texture dots for lime skin */}
      <circle cx="12" cy="22" r="0.6" fill="#4d7c0f" opacity="0.3" />
      <circle cx="22" cy="19" r="0.5" fill="#4d7c0f" opacity="0.3" />
      <circle cx="26" cy="25" r="0.6" fill="#4d7c0f" opacity="0.3" />
      <circle cx="17" cy="29" r="0.5" fill="#4d7c0f" opacity="0.3" />
      <circle cx="24" cy="31" r="0.5" fill="#4d7c0f" opacity="0.3" />

      {/* Stem */}
      <rect x="19" y="8" width="2" height="4" rx="0.8" fill="#65a30d" />

      {/* Leaf */}
      <path
        d="M 21 9 Q 28 5, 32 10 Q 29 13, 23 12 Q 21 11, 21 9 Z"
        fill="url(#leafGrad)"
        stroke="#3f6212"
        strokeWidth="0.5"
      />
      {/* Leaf vein */}
      <path d="M 22 10 Q 27 9, 30 10" stroke="#4d7c0f" strokeWidth="0.4" fill="none" opacity="0.7" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tighter ${className}`}>
      Limero
    </span>
  );
}
