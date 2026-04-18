export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="silverGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6f6f7" />
          <stop offset="50%" stopColor="#adaeb6" />
          <stop offset="100%" stopColor="#e9e9ec" />
        </linearGradient>
        <linearGradient id="silverGradDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#82848e" />
          <stop offset="100%" stopColor="#38383d" />
        </linearGradient>
      </defs>
      <path
        d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z"
        stroke="url(#silverGrad)"
        strokeWidth="1.25"
        fill="url(#silverGradDark)"
        fillOpacity="0.2"
      />
      <path
        d="M16 8 L22 11.5 L22 20.5 L16 24 L10 20.5 L10 11.5 Z"
        fill="url(#silverGrad)"
        fillOpacity="0.9"
      />
      <circle cx="16" cy="16" r="1.5" fill="#0a0a0b" />
    </svg>
  );
}
