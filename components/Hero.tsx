"use client";

import Link from "next/link";
import { useReadContract } from "wagmi";
import { Logo, Wordmark } from "@/components/Logo";
import { ConnectButton } from "@/components/ConnectButton";
import { addresses, factoryAbi } from "@/lib/contracts";

/**
 * HERO v11 — Composition fix.
 *
 * Problem with v10: text was centered, but the mascot occupies center-bottom
 * of the image → headline always landed on the face.
 *
 * Fix:
 * - Text anchored LEFT (mascot lives center-right in our image)
 * - Headline + CTAs all in the left 50% of the viewport
 * - Left side has stronger vignette to protect text
 * - Right side stays clean for the mascot/lemons
 */
export function Hero() {
  const { data: length } = useReadContract({
    address: addresses.factory,
    abi: factoryAbi,
    functionName: "marketsLength",
  });
  const count = Number(length ?? 0n);

  return (
    <section className="relative flex min-h-[760px] w-full flex-col overflow-hidden lg:min-h-[88vh]">
      {/* BACKGROUND IMAGE - full bleed */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-image.jpg"
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
          loading="eager"
          // @ts-ignore
          fetchPriority="high"
        />
      </div>

      {/* OVERLAYS */}
      {/* Strong left-side darkening to protect text */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(6,9,16,0.92) 0%, rgba(6,9,16,0.75) 25%, rgba(6,9,16,0.35) 50%, transparent 70%)",
        }}
      />
      {/* Top header area protection */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,9,16,0.7) 0%, transparent 100%)",
        }}
      />
      {/* Bottom transition */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(10,14,20,0.8) 60%, #0a0e14 100%)",
        }}
      />

      {/* FLOATING HEADER */}
      <header className="relative z-30 w-full">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8 text-lime-400 drop-shadow-[0_0_20px_rgba(132,204,22,0.4)]" />
            <Wordmark
              className="text-[19px] text-white"
              style={{ letterSpacing: "-0.04em" }}
            />
            <span className="ml-2 rounded-md border border-lime-400/30 bg-white/5 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-lime-200 backdrop-blur-md">
              Testnet
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <HeaderLink href="#markets">Markets</HeaderLink>
            <HeaderLink href="#astronomical-juice">Engine</HeaderLink>
            <HeaderLink href="#how-it-works">How it works</HeaderLink>
            <HeaderLink href="https://docs.litvm.com" external>Docs</HeaderLink>
          </nav>

          <ConnectButton />
        </div>
      </header>

      {/* LEFT-ANCHORED CONTENT */}
      <div className="relative z-20 flex flex-1 items-center px-6 pb-16 pt-4 lg:px-10">
        <div className="max-w-2xl">
          {/* Live badge */}
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-black/40 px-3.5 py-1.5 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime-400 opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-lime-400" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-200">
              Live on LitVM · LiteForge Testnet
            </span>
          </div>

          {/* Headline - left aligned */}
          <h1
            className="animate-fade-up headline-display text-white [text-wrap:balance]"
            style={{
              fontSize: "clamp(48px, 6.2vw, 92px)",
              animationDelay: "0.05s",
              textShadow: "0 4px 40px rgba(0,0,0,0.7)",
              letterSpacing: "-0.045em",
              lineHeight: "0.95",
            }}
          >
            Trade the{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #d9f99d 0%, #bef264 50%, #84cc16 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 25px rgba(190, 242, 100, 0.3))",
              }}
            >
              future
            </span>
            <br />
            in{" "}
            <span
              className="italic"
              style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
            >
              hard money
            </span>
            .
          </h1>

          {/* Subhead */}
          <p
            className="animate-fade-up mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg"
            style={{
              animationDelay: "0.1s",
              textShadow: "0 2px 20px rgba(0,0,0,0.9)",
            }}
          >
            The first binary prediction market native to LitVM.
            Price real-world outcomes in{" "}
            <span className="font-semibold text-lime-200">$LIME</span>, settled
            onchain by Litecoin's proof-of-work security.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "0.15s" }}
          >
            <Link
              href="#markets"
              className="btn-lime inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm"
            >
              Explore markets
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="#astronomical-juice"
              className="btn-ghost rounded-xl px-7 py-3.5 text-sm"
            >
              See the engine
            </Link>
          </div>

          {/* Terminal pills */}
          <div
            className="animate-fade-up mt-8 flex flex-wrap items-center gap-2"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="terminal-pill">MAINNET Q3 2026</span>
            <span className="terminal-pill">CHAIN 4441</span>
            <span className="terminal-pill">{count} ACTIVE MARKETS</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeaderLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group relative text-sm font-medium text-white/85 transition hover:text-lime-200"
      style={{ textShadow: "0 1px 10px rgba(0,0,0,0.6)" }}
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-lime-400 to-transparent transition-all duration-300 group-hover:w-full" />
    </a>
  );
}
