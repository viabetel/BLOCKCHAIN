export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="limeBodyMini" x1="0.3" y1="0.2" x2="0.7" y2="0.9">
          <stop offset="0%" stopColor="#d9f99d" />
          <stop offset="50%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#65a30d" />
        </linearGradient>
        <linearGradient id="leafMini" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4d7c0f" />
          <stop offset="100%" stopColor="#365314" />
        </linearGradient>
      </defs>

      {/* Lime body */}
      <ellipse cx="16" cy="18" rx="11" ry="10" fill="url(#limeBodyMini)" />

      {/* Rim */}
      <ellipse cx="16" cy="18" rx="11" ry="10" fill="none" stroke="#84cc16" strokeWidth="0.5" opacity="0.5" />

      {/* Highlight */}
      <ellipse cx="12" cy="14" rx="4" ry="3" fill="#ffffff" opacity="0.25" />

      {/* Stem */}
      <rect x="15.2" y="6" width="1.6" height="3" rx="0.6" fill="#65a30d" />

      {/* Leaf */}
      <path
        d="M 16.5 6.5 Q 22 3, 25 7 Q 22 9.5, 17.5 8.5 Q 16.5 7.5, 16.5 6.5 Z"
        fill="url(#leafMini)"
      />
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
