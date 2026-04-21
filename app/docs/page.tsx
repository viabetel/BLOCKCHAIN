import Link from "next/link";

const docs = [
  { slug: "pitch", title: "Pitch", desc: "LitVM-aligned positioning and one-liner." },
  { slug: "application", title: "Application", desc: "Builder-facing application draft." },
  { slug: "architecture", title: "Architecture", desc: "Protocol structure and strategic layers." },
  { slug: "risk-model", title: "Risk Model", desc: "Operational and product risks for testnet." },
  { slug: "testnet-scope", title: "Testnet Scope", desc: "30/60/90 priorities and deployment scope." },
];

export default function DocsIndexPage() {
  return (
    <main className="min-h-screen bg-space-deep px-6 py-16 text-text-primary lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <span className="chip chip-featured">Local docs</span>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-tighter">Limero builder pack</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
            I exposed the internal markdown docs as navigable pages inside the project, so the app now has a real documentation surface instead of dead links.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {docs.map((doc) => (
            <Link key={doc.slug} href={`/docs/${doc.slug}`} className="card-glass rounded-3xl p-6 transition hover:-translate-y-0.5 hover:border-lime-500/30">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">{doc.slug}</div>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-text-primary">{doc.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{doc.desc}</p>
              <div className="mt-6 text-sm font-semibold text-lime-300">Open doc →</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
