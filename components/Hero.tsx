"use client";

import Link from "next/link";
import { useReadContract } from "wagmi";
import { addresses, factoryAbi } from "@/lib/contracts";
import { formatEther } from "viem";

/**
 * HERO v9 — Premium refinement.
 * Key improvements:
 * - Satoshi display font (loaded via Fontshare in layout)
 * - Strong vignette overlays protecting text readability on top of image
 * - Hero text backdrop gradients creating "paper" areas
 * - Stats in glass capsules (not a plain strip)
 * - Headline with tight tracking + heavy weight
 * - Refined gradient on "future" word
 */
export function Hero() {
  const { data: length } = useReadContract({
    address: addresses.factory,
    abi: factoryAbi,
    functionName: "marketsLength",
  });
  const count = Number(length ?? 0n);

  return (
    <section className="relative overflow-hidden bg-space-deep">
      {/* Ambient glow from page background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[50%] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(132,204,22,0.08),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-space" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 pt-8 lg:px-8 lg:pt-10">
        {/* Live badge */}
        <div className="mb-5 flex justify-center lg:justify-start">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/5 px-3.5 py-1.5 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime-400 opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-lime-400" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-200">
              Live on LitVM · LiteForge Testnet
            </span>
          </div>
        </div>

        {/* IMAGE CONTAINER */}
        <div className="relative mx-auto w-full overflow-hidden rounded-2xl ring-1 ring-white/5">
          {/* Hero image — 16:9 preserved, no crop */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-image.jpg"
            alt="Limero — Lime mascot in cosmic prediction market scene"
            className="block h-auto w-full select-none"
            style={{ aspectRatio: "16 / 9" }}
            draggable={false}
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
          />

          {/* VIGNETTE OVERLAYS — protect readability without killing the image */}
          {/* Left-top darker area for headline */}
          <div
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              background:
                "radial-gradient(ellipse 55% 65% at 0% 0%, rgba(6, 9, 16, 0.78) 0%, rgba(6, 9, 16, 0.35) 40%, transparent 75%)",
            }}
          />
          {/* Right-top darker area for subhead */}
          <div
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              background:
                "radial-gradient(ellipse 45% 55% at 100% 0%, rgba(6, 9, 16, 0.7) 0%, rgba(6, 9, 16, 0.3) 45%, transparent 75%)",
            }}
          />
          {/* Bottom fade for stats strip readability */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(6, 9, 16, 0.4) 60%, rgba(6, 9, 16, 0.75) 100%)",
            }}
          />

          {/* DESKTOP: Headline (left) + Subhead+CTAs (right) */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            {/* HEADLINE — left */}
            <div className="absolute left-[5%] top-[12%] max-w-[44%]">
              <h1
                className="animate-fade-up pointer-events-auto headline-display text-text-primary [text-wrap:balance]"
                style={{
                  fontSize: "clamp(44px, 4.8vw, 72px)",
                  animationDelay: "0.05s",
                  textShadow:
                    "0 2px 40px rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.5)",
                }}
              >
                Trade the{" "}
                <span className="text-gradient-lime">future</span>
                <br />
                in <span className="italic font-semibold" style={{ fontFamily: "var(--font-display)" }}>hard money</span>.
              </h1>
              <div
                className="animate-fade-up pointer-events-auto mt-7 flex items-center gap-3"
                style={{ animationDelay: "0.15s" }}
              >
                <Link
                  href="#markets"
                  className="btn-lime inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm"
                >
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
            </div>

            {/* SUBHEAD — right */}
            <div className="absolute right-[5%] top-[14%] max-w-[32%]">
              <p
                className="animate-fade-up pointer-events-auto text-right text-base leading-[1.55] text-white/90"
                style={{
                  fontSize: "clamp(13px, 1.05vw, 16px)",
                  animationDelay: "0.1s",
                  textShadow: "0 1px 20px rgba(0,0,0,0.8)",
                  fontWeight: 400,
                }}
              >
                The first binary prediction market native to LitVM.
                Price real-world outcomes in <span className="font-semibold text-lime-200">$LIME</span>, settled onchain by
                Litecoin's proof-of-work security.
              </p>
              <div
                className="animate-fade-up pointer-events-auto mt-4 flex items-center justify-end gap-2"
                style={{ animationDelay: "0.18s" }}
              >
                <span className="terminal-pill">MAINNET Q3 2026</span>
                <span className="terminal-pill">CHAIN 4441</span>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE content below image */}
        <div className="mt-8 lg:hidden">
          <h1
            className="animate-fade-up headline-display text-text-primary [text-wrap:balance]"
            style={{
              fontSize: "clamp(40px, 10vw, 60px)",
              animationDelay: "0.05s",
            }}
          >
            Trade the <span className="text-gradient-lime">future</span> in <span className="italic font-semibold">hard money</span>.
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg"
            style={{ animationDelay: "0.1s" }}
          >
            Limero is the first binary prediction market native to LitVM.
            Price real-world outcomes in <span className="font-semibold text-lime-200">$LIME</span>, settled onchain by Litecoin's
            proof-of-work security.
          </p>
          <div
            className="animate-fade-up mt-6 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "0.15s" }}
          >
            <Link
              href="#markets"
              className="btn-lime inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm"
            >
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
        </div>

        {/* STATS STRIP — Glass capsules */}
        <div
          className="animate-fade-up mt-10 grid grid-cols-2 gap-3 md:grid-cols-4"
          style={{ animationDelay: "0.22s" }}
        >
          <StatCapsule label="Active markets" value={count.toString()} />
          <StatCapsule label="Settlement asset" value="$LIME" accent />
          <StatCapsule label="Chain" value="LiteForge" sub="4441" mono />
          <StatCapsule label="Status" value="Live" pulse />
        </div>

        <div className="h-16" />
      </div>
    </section>
  );
}

function StatCapsule({
  label,
  value,
  sub,
  mono,
  accent,
  pulse,
}: {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
  accent?: boolean;
  pulse?: boolean;
}) {
  return (
    <div className="glass-capsule rounded-2xl px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        {pulse && (
          <span className="mr-1 h-1.5 w-1.5 animate-pulse-dot rounded-full bg-lime-400" />
        )}
        <span
          className={`text-2xl font-bold tracking-tighter tabular ${
            mono ? "font-mono" : "font-display"
          } ${accent ? "text-gradient-lime" : "text-text-primary"}`}
        >
          {value}
        </span>
        {sub && (
          <span className="font-mono text-xs font-medium text-text-muted tabular">{sub}</span>
        )}
      </div>
    </div>
  );
}
