"use client";

import Link from "next/link";
import { useReadContract } from "wagmi";
import { addresses, factoryAbi } from "@/lib/contracts";

/**
 * Hero section built around the user's generated hero image (hero-image.jpg).
 * Key decisions:
 * - Image is 16:9, rendered as <img> with `w-full h-auto` so aspect ratio is
 *   preserved at all breakpoints. No cropping, no stretching.
 * - Text block (Limero headline, subhead, CTAs) sits BELOW the image on mobile,
 *   and is absolutely positioned on top-left on desktop (over the image's
 *   darkest area) so nothing overlaps the mascot.
 * - Background of the page (space-deep) matches the image's dark edges
 *   seamlessly, so the image looks embedded in the page, not pasted.
 * - Gradient fade below the image blends into the next section.
 * - Stats strip sits below image, not over it, so the mascot stays pristine.
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
      {/* Subtle cosmic glow that matches the image ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(132,204,22,0.06),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-space" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 pt-10 lg:px-8 lg:pt-14">
        {/* Live badge - sits above the image */}
        <div className="mb-6 flex justify-center lg:justify-start">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-lime-500/25 bg-lime-500/5 px-3 py-1.5 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime-400 opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-lime-400" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-lime-200">
              Live on LitVM · LiteForge Testnet
            </span>
          </div>
        </div>

        {/* IMAGE CONTAINER — preserves 16:9 aspect ratio perfectly */}
        <div className="relative mx-auto w-full">
          {/* The hero image — object-contain NEVER crops, w-full + h-auto keeps 16:9 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-image.jpg"
            alt="Limero — Lime mascot in cosmic prediction market scene"
            className="block h-auto w-full select-none"
            style={{ aspectRatio: "16 / 9" }}
            draggable={false}
            loading="eager"
            // @ts-ignore - fetchPriority is a valid attribute for LCP
            fetchPriority="high"
          />

          {/* DESKTOP OVERLAY: Headline sits over the top-left corner area which
              is mostly dark space in the reference image, so no conflict with mascot */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <div className="absolute left-[4%] top-[8%] max-w-[42%]">
              <h1
                className="animate-fade-up pointer-events-auto font-display font-bold leading-[0.95] tracking-tightest text-text-primary [text-wrap:balance]"
                style={{
                  fontSize: "clamp(32px, 3.6vw, 56px)",
                  animationDelay: "0.05s",
                  textShadow: "0 2px 30px rgba(0,0,0,0.6)",
                }}
              >
                Trade the
                <br />
                <span className="text-gradient-lime">future</span> in
                <br />
                hard money.
              </h1>
            </div>

            {/* Subhead + CTAs on the right side where image is also dark */}
            <div className="absolute right-[4%] top-[10%] max-w-[34%]">
              <p
                className="animate-fade-up pointer-events-auto text-right leading-relaxed text-text-secondary"
                style={{
                  fontSize: "clamp(13px, 1vw, 16px)",
                  animationDelay: "0.1s",
                  textShadow: "0 1px 20px rgba(0,0,0,0.6)",
                }}
              >
                The first binary prediction market native to LitVM.
                Price real-world outcomes in $LIME, settled onchain
                by Litecoin's proof-of-work security.
              </p>
              <div
                className="animate-fade-up pointer-events-auto mt-5 flex flex-wrap justify-end gap-2.5"
                style={{ animationDelay: "0.15s" }}
              >
                <Link href="#markets" className="btn-lime inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm">
                  Explore markets
                  <span aria-hidden>→</span>
                </Link>
                <Link href="#how-it-works" className="btn-ghost rounded-xl px-5 py-3 text-sm">
                  How it works
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE/TABLET content below image */}
        <div className="mt-8 lg:hidden">
          <h1
            className="animate-fade-up font-display text-[44px] font-bold leading-[0.95] tracking-tightest text-text-primary sm:text-[56px] [text-wrap:balance]"
            style={{ animationDelay: "0.05s" }}
          >
            Trade the <span className="text-gradient-lime">future</span> in hard money.
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg"
            style={{ animationDelay: "0.1s" }}
          >
            Limero is the first binary prediction market native to LitVM.
            Price real-world outcomes in $LIME, settled onchain by Litecoin's
            proof-of-work security.
          </p>
          <div
            className="animate-fade-up mt-6 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "0.15s" }}
          >
            <Link href="#markets" className="btn-lime inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm">
              Explore markets
              <span aria-hidden>→</span>
            </Link>
            <Link href="#how-it-works" className="btn-ghost rounded-xl px-6 py-3.5 text-sm">
              How it works
            </Link>
          </div>
        </div>

        {/* Stats strip — below image, clean and readable */}
        <div
          className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-y border-space-border py-5 lg:justify-start lg:gap-x-12"
          style={{ animationDelay: "0.2s" }}
        >
          <StatMini label="Active markets" value={count.toString()} />
          <StatDivider />
          <StatMini label="Settlement" value="$LIME" />
          <StatDivider />
          <StatMini label="Chain" value="LiteForge · 4441" mono />
          <StatDivider />
          <StatMini label="Status" value="Live" accent />
        </div>

        <div className="h-10" />
      </div>
    </section>
  );
}

function StatMini({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center lg:items-start">
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
        {label}
      </div>
      <div
        className={`mt-1 flex items-center gap-1.5 text-base font-semibold tabular ${
          mono ? "font-mono" : "font-display"
        } ${accent ? "text-lime-300" : "text-text-primary"}`}
      >
        {accent && <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-lime-400" />}
        {value}
      </div>
    </div>
  );
}

function StatDivider() {
  return <div className="h-8 w-px bg-space-border" />;
}
