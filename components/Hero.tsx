"use client";

import Link from "next/link";
import { useReadContract } from "wagmi";
import { Logo, Wordmark } from "@/components/Logo";
import { ConnectButton } from "@/components/ConnectButton";
import { addresses, factoryAbi } from "@/lib/contracts";

/**
 * HERO v10 — Full-bleed composition matching the reference poster style.
 *
 * Architecture:
 * - <section> is the viewport: full width, full height ~85vh desktop / auto mobile
 * - Background <img> fills 100% via object-cover (yes, some crop on extreme aspect
 *   ratios, but that's expected in full-bleed — user explicitly accepted)
 * - Dark gradient overlay at TOP protects header + headline legibility
 * - Dark gradient overlay at BOTTOM transitions into next section cleanly
 * - HEADER is absolute-positioned inside the section, fully transparent,
 *   with subtle gradient backdrop only at top (not a solid bar)
 * - CONTENT is centered vertically+horizontally using flex
 */
export function Hero() {
  const { data: length } = useReadContract({
    address: addresses.factory,
    abi: factoryAbi,
    functionName: "marketsLength",
  });
  const count = Number(length ?? 0n);

  return (
    <section className="relative flex min-h-[760px] w-full flex-col overflow-hidden lg:min-h-[85vh]">
      {/* ============================================
          BACKGROUND IMAGE - full bleed
          ============================================ */}
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

      {/* ============================================
          OVERLAYS - protect readability
          ============================================ */}
      {/* Top gradient - darkens top for header + headline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[55%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,9,16,0.85) 0%, rgba(6,9,16,0.55) 40%, rgba(6,9,16,0.2) 75%, transparent 100%)",
        }}
      />
      {/* Side vignettes - soften the edges where extra lemons appear */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% 50%, transparent 40%, rgba(6,9,16,0.35) 80%, rgba(6,9,16,0.6) 100%)",
        }}
      />
      {/* Bottom fade into next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(10,14,20,0.7) 60%, #0a0e14 100%)",
        }}
      />

      {/* ============================================
          FLOATING HEADER
          ============================================ */}
      <header className="relative z-30 w-full">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="h-9 w-9 drop-shadow-[0_2px_20px_rgba(132,204,22,0.3)]" />
            <Wordmark className="text-lg tracking-tighter text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]" />
            <span className="ml-1 rounded-md border border-lime-400/30 bg-white/5 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-lime-200 backdrop-blur-md">
              Testnet
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <HeaderLink href="#markets">Markets</HeaderLink>
            <HeaderLink href="#how-it-works">How it works</HeaderLink>
            <HeaderLink href="https://liteforge.hub.caldera.xyz" external>Faucet</HeaderLink>
            <HeaderLink href="https://docs.litvm.com" external>Docs</HeaderLink>
          </nav>

          <ConnectButton />
        </div>
      </header>

      {/* ============================================
          CENTERED CONTENT
          ============================================ */}
      <div className="relative z-20 flex flex-1 items-start justify-center px-6 pb-16 pt-4 lg:pb-24 lg:pt-6">
        <div className="w-full max-w-4xl text-center">
          {/* Live badge */}
          <div className="animate-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-black/40 px-4 py-1.5 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime-400 opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-lime-400" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-200">
              Live on LitVM · LiteForge Testnet
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up headline-display text-white [text-wrap:balance]"
            style={{
              fontSize: "clamp(48px, 7.2vw, 104px)",
              animationDelay: "0.05s",
              textShadow:
                "0 4px 40px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.5)",
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
            className="animate-fade-up mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg"
            style={{
              animationDelay: "0.1s",
              textShadow: "0 2px 20px rgba(0,0,0,0.8)",
              letterSpacing: "-0.005em",
            }}
          >
            The first binary prediction market native to LitVM.
            Price real-world outcomes in{" "}
            <span className="font-semibold text-lime-200">$LIME</span>, settled
            onchain by Litecoin's proof-of-work security.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "0.15s" }}
          >
            <Link
              href="#markets"
              className="btn-lime inline-flex items-center gap-2 rounded-xl px-7 py-4 text-sm"
            >
              Explore markets
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="#how-it-works"
              className="btn-ghost rounded-xl px-7 py-4 text-sm"
            >
              How it works
            </Link>
          </div>

          {/* Terminal pills */}
          <div
            className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-2"
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
