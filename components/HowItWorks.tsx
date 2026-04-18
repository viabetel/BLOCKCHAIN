export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-ink-pure py-24 text-paper-pure">
      {/* Subtle grid on dark */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand/10 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-14 max-w-3xl">
          <span className="chip border border-ink-700 bg-ink-900 text-ink-300">
            <span className="h-1 w-1 rounded-full bg-brand" />
            Protocol
          </span>
          <h2 className="mt-5 font-display text-5xl font-semibold tracking-tighter sm:text-6xl">
            Four steps to a
            <br />
            <span className="text-brand-light">settled outcome.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-ink-400">
            Silvercast runs on a Fixed Product Market Maker. Each market holds a
            pool of YES and NO outcome tokens that settle 1:1 against zkLTC once
            the oracle resolves.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          <Step
            n="01"
            title="Pick a side"
            body="Every market asks a yes-or-no question. Buy YES if you think it resolves true, NO if not. Price is the market's live probability."
          />
          <Step
            n="02"
            title="Trade the price"
            body="Prices move as traders buy in. If YES sits at 32%, you pay 0.32 zkLTC per share. Sell anytime before resolution to take profit or cut losses."
          />
          <Step
            n="03"
            title="Oracle resolves"
            body="At expiry, the oracle reports the outcome onchain. Liquidity providers and traders can immediately see the final result."
          />
          <Step
            n="04"
            title="Redeem 1:1"
            body="Winning shares redeem 1 zkLTC each. Losing shares go to zero. Liquidity providers get paid out from the winning side of the pool."
          />
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <a
            href="https://docs.litvm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-paper-pure px-5 py-2.5 text-sm font-medium text-ink-pure transition hover:bg-ink-200"
          >
            Read LitVM docs
            <span aria-hidden>↗</span>
          </a>
          <a
            href="https://liteforge.hub.caldera.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-700 px-5 py-2.5 text-sm font-medium text-paper-pure transition hover:border-paper-pure"
          >
            Get testnet zkLTC
          </a>
        </div>
      </div>
    </section>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="group relative rounded-2xl border border-ink-800 bg-ink-900 p-6 transition hover:border-brand hover:bg-ink-800">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-brand-light tabular">
          {n}
        </span>
        <span className="h-px flex-1 ml-4 bg-ink-800 group-hover:bg-brand transition" />
      </div>
      <h3 className="mb-3 font-display text-xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-ink-400">{body}</p>
    </div>
  );
}
