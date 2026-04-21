import type { ReactNode } from "react";
import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

const slugToFile: Record<string, string> = {
  "pitch": "PITCH.md",
  "application": "APPLICATION.md",
  "architecture": "ARCHITECTURE.md",
  "risk-model": "RISK-MODEL.md",
  "testnet-scope": "TESTNET-SCOPE.md",
};

function renderMarkdown(text: string) {
  const lines = text.split(/\r?\n/);
  const out: ReactNode[] = [];
  let listItems: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = (key: string) => {
    if (!paragraph.length) return;
    out.push(<p key={key} className="mt-4 text-[15px] leading-8 text-text-secondary">{paragraph.join(" ")}</p>);
    paragraph = [];
  };
  const flushList = (key: string) => {
    if (!listItems.length) return;
    out.push(
      <ul key={key} className="mt-4 space-y-2 pl-5 text-[15px] leading-8 text-text-secondary">
        {listItems.map((item, i) => <li key={i} className="list-disc">{item}</li>)}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) {
      flushParagraph(`p-${idx}`);
      flushList(`l-${idx}`);
      return;
    }
    if (line.startsWith("# ")) {
      flushParagraph(`p-${idx}`); flushList(`l-${idx}`);
      out.push(<h1 key={`h1-${idx}`} className="mt-10 font-display text-4xl font-bold tracking-tighter text-text-primary first:mt-0">{line.slice(2)}</h1>);
      return;
    }
    if (line.startsWith("## ")) {
      flushParagraph(`p-${idx}`); flushList(`l-${idx}`);
      out.push(<h2 key={`h2-${idx}`} className="mt-10 font-display text-2xl font-semibold tracking-tight text-text-primary">{line.slice(3)}</h2>);
      return;
    }
    if (line.startsWith("### ")) {
      flushParagraph(`p-${idx}`); flushList(`l-${idx}`);
      out.push(<h3 key={`h3-${idx}`} className="mt-8 text-lg font-semibold text-text-primary">{line.slice(4)}</h3>);
      return;
    }
    if (line.startsWith("- ")) {
      flushParagraph(`p-${idx}`);
      listItems.push(line.slice(2));
      return;
    }
    paragraph.push(line);
  });

  flushParagraph("p-end");
  flushList("l-end");
  return out;
}

export async function generateStaticParams() {
  return Object.keys(slugToFile).map((slug) => ({ slug }));
}

export default async function DocPage({ params }: { params: { slug: string } }) {
  const file = slugToFile[params.slug];
  if (!file) notFound();

  const fullPath = path.join(process.cwd(), "docs", file);
  const text = await fs.readFile(fullPath, "utf8");

  return (
    <main className="min-h-screen bg-space-deep px-6 py-16 text-text-primary lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/docs" className="text-sm font-semibold text-lime-300 hover:text-lime-200">← Back to docs</Link>
          <span className="terminal-pill">{file}</span>
        </div>
        <article className="card-glass rounded-[32px] p-8 sm:p-10">
          {renderMarkdown(text)}
        </article>
      </div>
    </main>
  );
}
