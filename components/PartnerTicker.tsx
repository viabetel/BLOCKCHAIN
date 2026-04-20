"use client";

import { ECOSYSTEM_PARTNERS } from "@/components/TokenIcon";

/**
 * EcosystemTicker — honest representation of LitVM's infrastructure stack.
 *
 * No sponsorship claims, no "backed by X" implications. These are the real
 * components that LitVM docs attest to:
 *   - LitVM: the L2 rollup we're deployed on
 *   - Arbitrum Orbit: the stack LitVM uses
 *   - Caldera: LitVM's infrastructure provider
 *   - Espresso: decentralized sequencer
 */
export function PartnerTicker() {
  const loop = [...ECOSYSTEM_PARTNERS, ...ECOSYSTEM_PARTNERS, ...ECOSYSTEM_PARTNERS];

  return (
    <div className="relative overflow-hidden border-y border-space-border bg-space-deep py-7">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-space-deep to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-space-deep to-transparent" />

      <div className="mb-3 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-muted">
          Built on the LitVM ecosystem
        </span>
      </div>
      <div className="flex animate-ticker items-center whitespace-nowrap">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 px-8">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: item.color,
                boxShadow: `0 0 10px ${item.color}60`,
              }}
            />
            <span className="font-display text-sm font-semibold tracking-tight text-text-secondary">
              {item.name}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted">
              {item.role}
            </span>
            <span className="text-space-border">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
