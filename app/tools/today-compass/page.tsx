import type { Metadata } from "next";
import Link from "next/link";
import { CockpitNav } from "@/components/cockpit/CockpitNav";
import { Compass } from "@/components/today-compass/Compass";
import { TodaySummary } from "@/components/today-compass/TodaySummary";
import { prisma } from "@/lib/prisma";
import type {
  AvailableTime,
  ActionCategory,
  ActionCard,
  Energy,
  Focus,
} from "@/lib/today-compass/types";

export const metadata: Metadata = {
  title: "Today Compass",
  description:
    "A gentle tool for finding the next grounded step inside a noisy day.",
};

export const dynamic = "force-dynamic";

export default async function TodayCompassPage() {
  const records = await prisma.actionCard.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "asc" },
  });
  const toActionCard = (record: (typeof records)[number]): ActionCard => ({
    id: record.id,
    title: record.title,
    description: record.description,
    minutes: record.minutes as AvailableTime,
    energy: record.energy as Energy,
    focus: record.focus as Focus,
    category: record.category as ActionCategory,
    thread: record.thread,
  });
  const actions = records.map(toActionCard);

  return (
    <div className="page-shell">
      <CockpitNav />
      <header className="max-w-3xl pb-12 pt-14 md:pb-16 md:pt-20">
        <Link
          href="/tools"
          className="text-xs uppercase tracking-[0.2em] text-moss transition hover:text-ink"
        >
          ← Tool shelf
        </Link>
        <p className="mt-12 text-xs uppercase tracking-[0.22em] text-lavender">
          A small daily instrument
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-tight text-ink md:text-7xl">
          Today Compass
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
          Tell the compass what kind of day you are actually having. It will
          find a few grounded actions that fit—without pretending every day
          needs to be optimized.
        </p>
      </header>
      <TodaySummary />
      <Compass initialActions={actions} />
      <p className="mt-5 pb-16 text-center text-xs leading-6 text-muted">
        Action cards are stored in a local SQLite database. Recommendations use
        a transparent scoring rule; no data leaves this machine.
      </p>
    </div>
  );
}
