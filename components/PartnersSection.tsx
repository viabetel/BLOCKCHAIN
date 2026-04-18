export function PartnersSection() {
  return (
    <section className="border-y border-ink-200 bg-paper-off py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-ink-300" />
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-ink-500">
            Built on the LitVM stack
          </span>
          <span className="h-px w-12 bg-ink-300" />
        </div>

        <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          <PartnerMark name="Litecoin" />
          <PartnerMark name="LitVM" />
          <PartnerMark name="Arbitrum" />
          <PartnerMark name="Caldera" />
          <PartnerMark name="BitcoinOS" />
          <PartnerMark name="Succinct" />
          <PartnerMark name="Espresso" />
        </div>
      </div>
    </section>
  );
}

function PartnerMark({ name }: { name: string }) {
  return (
    <div className="group flex items-center justify-center gap-2 py-2 transition hover:opacity-100 opacity-50 hover:scale-105 duration-300">
      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-ink-300 bg-paper-pure text-[11px] font-bold text-ink-pure tabular">
        {name.slice(0, 1)}
      </div>
      <span className="font-display text-sm font-semibold tracking-tight text-ink-800">
        {name}
      </span>
    </div>
  );
}
