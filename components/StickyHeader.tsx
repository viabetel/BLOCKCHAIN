"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo, Wordmark } from "@/components/Logo";
import { ConnectButton } from "@/components/ConnectButton";

/**
 * Sticky header that fades in AFTER the user scrolls past the hero.
 * Pattern used by Linear, Arbitrum, Monad — floating header during hero,
 * solid header after scroll.
 */
export function StickyHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show when scrolled past ~70% of viewport height
      setVisible(window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-space-deep/80 backdrop-blur-2xl transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      {/* Subtle lime glow line at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-lime-500/20 to-transparent" />

      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3.5 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-8" />
          <Wordmark className="text-lg tracking-tighter text-text-primary" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <StickyNavLink href="#markets">Markets</StickyNavLink>
          <StickyNavLink href="#how-it-works">How it works</StickyNavLink>
          <StickyNavLink href="https://liteforge.hub.caldera.xyz" external>Faucet</StickyNavLink>
          <StickyNavLink href="https://docs.litvm.com" external>Docs</StickyNavLink>
        </nav>

        <ConnectButton />
      </div>
    </header>
  );
}

function StickyNavLink({
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
      className="group relative text-sm font-medium text-text-secondary transition hover:text-lime-200"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-lime-400 to-transparent transition-all duration-300 group-hover:w-full" />
    </a>
  );
}
