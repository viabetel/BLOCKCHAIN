/**
 * Token icon components — no styled-jsx, just plain Tailwind + inline styles.
 */

/**
 * LimeTokenIcon — the official $LIME token visual using our Logo SVG.
 */
export function LimeTokenIcon({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const innerSize = Math.round(size * 0.58);
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, #fde047 0%, #bef264 50%, #65a30d 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px -2px rgba(132,204,22,0.35)",
      }}
      aria-label="$LIME token"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={innerSize}
        height={innerSize}
        style={{ color: "#0a0e14" }}
      >
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <circle cx="16" cy="16" r="9.5" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.55" />
        <circle cx="16" cy="16" r="1.6" fill="currentColor" />
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
    </span>
  );
}

/** USDC token icon */
export function UsdcTokenIcon({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/5 ${className}`}
      style={{ width: size, height: size }}
      aria-label="USDC"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
        alt="USDC"
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    </span>
  );
}

/** zkLTC token icon (styled as a silver Litecoin-inspired coin) */
export function ZkLtcTokenIcon({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #cbd5e1 0%, #64748b 60%, #334155 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px -2px rgba(100,116,139,0.35)",
      }}
      aria-label="zkLTC"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://assets-cdn.trustwallet.com/blockchains/litecoin/info/logo.png"
        alt="zkLTC"
        style={{ width: size * 0.65, height: size * 0.65 }}
      />
    </span>
  );
}
