import Link from "next/link";
import type { Tool } from "@/lib/types";

export function ToolCard({ tool }: { tool: Tool }) {
  const card = (
    <article className="soft-card group flex h-full min-h-[232px] flex-col p-7">
      <div className="mb-8 flex items-start justify-between gap-4">
        <span aria-hidden="true" className="text-xl text-lavender/80">
          ◌
        </span>
        <span className="status-pill">{tool.status}</span>
      </div>
      <h3 className="font-display text-xl text-ink">{tool.title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{tool.description}</p>
      {tool.href ? (
        <span className="mt-auto pt-6 text-sm text-moss transition-all group-hover:translate-x-1">
          Open tool <span aria-hidden="true">→</span>
        </span>
      ) : null}
    </article>
  );

  return tool.href ? (
    <Link
      href={tool.href}
      aria-label={`Open ${tool.title}`}
      className="block h-full"
    >
      {card}
    </Link>
  ) : (
    card
  );
}
