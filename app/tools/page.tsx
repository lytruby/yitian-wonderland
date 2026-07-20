import type { Metadata } from "next";
import { ToolCard } from "@/components/ToolCard";
import { tools } from "@/content/tools";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  return (
    <div className="page-shell">
      <header className="page-intro">
        <h1>Tools</h1>
        <p>
          Small instruments for noisy minds and real workflows. Mostly quiet,
          intentionally narrow, and designed to give some attention back.
        </p>
      </header>
      <div className="grid gap-5 pb-16 md:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard key={tool.title} tool={tool} />
        ))}
      </div>
      <aside className="mb-16 rounded-3xl border border-dashed border-lavender/30 p-7 text-sm leading-6 text-muted">
        <span className="mr-3 text-lavender" aria-hidden="true">
          ✦
        </span>
        Today Compass is now open in a small, local-first MVP. More instruments
        will appear here as their questions become clearer.
      </aside>
    </div>
  );
}
