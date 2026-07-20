import type { Metadata } from "next";
import { IdeaVault } from "@/components/idea-vault/IdeaVault";

export const metadata: Metadata = { title: "创业灵感库" };

export default function IdeaVaultPage() {
  return (
    <div className="page-shell">
      <header className="pb-8 pt-16 md:pb-10 md:pt-20">
        <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-moss"><span className="h-px w-7 bg-moss/40" />Idea garden</p>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-5xl tracking-tight text-ink md:text-6xl">创业灵感库</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">先接住每一个念头，再慢慢判断它要长成生意、实验，还是一段有趣的岔路。</p>
          </div>
          <p className="pb-1 text-xs text-muted"><span className="mr-2 text-lavender">✦</span>今天有 1 个想法在发芽</p>
        </div>
      </header>
      <IdeaVault />
    </div>
  );
}
