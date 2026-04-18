"use client";

import Link from "next/link";
import { useReadContract } from "wagmi";
import { MascotStage } from "@/components/MascotStage";
import { addresses, factoryAbi } from "@/lib/contracts";

export function Hero({ mascotSrc }: { mascotSrc?: string }) {
  const { data: length } = useReadContract({
    address: addresses.factory,
    abi: factoryAbi,
    functionName: "marketsLength",
  });
  const count = Number(length ?? 0n);

  return (
    <section className="cosmic-bg relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay" />

      <div className="relative mx-auto max-w-[1400px] px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          {/* LEFT: copy */}
          <div className="relative z-10">
            {/* Live badge */}
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-lime-500/25 bg-lime-500/5 px-3 py-1.5 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-lime-400 opacity-75" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-lime-400" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-lime-200">
                Live on LitVM · LiteForge Testnet
              </span>
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-up mt-6 font-display text-[54px] font-bold leading-[0.95] tracking-tightest text-text-primary sm:text-[68px] lg:text-[76px] [text-wrap:balance]"
              style={{ animationDelay: "0.05s" }}
            >
              Trade the
              <br />
              <span className="text-gradient-lime">future</span> in hard money.
            </h1>

            {/* Subhead */}
            <p
              className="animate-fade-up mt-6 max-w-lg text-lg leading-relaxed text-text-secondary"
              style={{ animationDelay: "0.1s" }}
            >
              Limero is the first binary prediction market native to LitVM.
              Price real-world outcomes in $LIME, settled onchain by Litecoin's
              proof-of-work security.
            </p>

            {/* CTA row */}
            <div
              className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.15s" }}
            >
              <Link href="#markets" className="btn-lime inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm">
                Explore markets
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="#how-it-works"
                className="btn-ghost rounded-xl px-6 py-3.5 text-sm"
              >
                How it works
              </Link>
            </div>

            {/* Live stats strip */}
            <div
              className="animate-fade-up mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-space-border pt-6"
              style={{ animationDelay: "0.2s" }}
            >
              <StatMini label="Active markets" value={count.toString()} />
              <div className="h-8 w-px bg-space-border" />
              <StatMini label="Settlement" value="$LIME" />
              <div className="h-8 w-px bg-space-border" />
              <StatMini label="Chain" value="LiteForge · 4441" mono />
            </div>
          </div>

          {/* RIGHT: mascot stage */}
          <div
            className="animate-fade-up relative mx-auto w-full max-w-[560px] lg:mx-0"
            style={{ animationDelay: "0.1s" }}
          >
            <MascotStage mascotSrc={mascotSrc} />
          </div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-space" />
    </section>
  );
}

function StatMini({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
        {label}
      </div>
      <div
        className={`mt-1 text-base font-semibold text-text-primary tabular ${
          mono ? "font-mono" : "font-display"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
