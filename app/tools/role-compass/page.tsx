import type { Metadata } from "next";
import Link from "next/link";
import { RoleCompass } from "@/components/role-compass/RoleCompass";

export const metadata: Metadata = {
  title: "Role Compass",
  description: "A quiet shortlist of software and AI roles matched to Yitian's experience and constraints.",
};

export default function RoleCompassPage() {
  return (
    <div className="page-shell">
      <header className="max-w-4xl pb-10 pt-14 md:pb-12 md:pt-20">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <Link href="/tools" className="text-xs uppercase tracking-[0.2em] text-moss transition hover:text-ink">← Tool shelf</Link>
          <span className="rounded-full border border-lavender/20 bg-lavender/5 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] text-lavender">v0 · local prototype</span>
        </div>
        <p className="mt-12 text-xs uppercase tracking-[0.22em] text-lavender">Less searching, better choices</p>
        <h1 className="mt-4 font-display text-5xl tracking-tight text-ink md:text-7xl">Role Compass</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">A small search agent built around your real direction: creative senior software work, AI tools, S$150k+, remote or Singapore. It removes the noise before you arrive.</p>
      </header>
      <RoleCompass />
    </div>
  );
}
