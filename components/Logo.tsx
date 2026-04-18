export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#0a0a0a" />
      <path
        d="M10 12 Q10 9 13 9 L19 9 Q22 9 22 12 Q22 14.5 19 14.5 L13 14.5 Q10 14.5 10 17 Q10 19.5 13 19.5 L19 19.5 Q22 19.5 22 22.5 Q22 25 19 25 L13 25 Q10 25 10 22.5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tighter ${className}`}>
      Silvercast
    </span>
  );
}
