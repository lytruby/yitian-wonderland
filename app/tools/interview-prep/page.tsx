import type { Metadata } from "next";
import Link from "next/link";
import { InterviewPrepDashboard } from "@/components/interview-prep/InterviewPrepDashboard";
import { prisma } from "@/lib/prisma";
import type {
  PrepItem,
  PrepPriority,
  PrepStatus,
  PrepTrack,
} from "@/lib/interview-prep/types";

export const metadata: Metadata = {
  title: "Interview Prep",
  description:
    "A living map of interview knowledge, practice questions, and honest readiness.",
};

export const dynamic = "force-dynamic";

export default async function InterviewPrepPage() {
  const records = await prisma.prepItem.findMany({
    include: {
      evidence: { orderBy: { createdAt: "desc" } },
      _count: { select: { questions: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
  const items: PrepItem[] = records.map((item) => ({
    id: item.id,
    track: item.track as PrepTrack,
    section: item.section,
    title: item.title,
    description: item.description,
    sourceUrl: item.sourceUrl,
    difficulty: item.difficulty,
    status: item.status as PrepStatus,
    priority: item.priority as PrepPriority,
    notes: item.notes,
    lastReviewedAt: item.lastReviewedAt?.toISOString() ?? null,
    sortOrder: item.sortOrder,
    questionCount: item._count.questions,
    evidence: item.evidence.map((evidence) => ({
      id: evidence.id,
      title: evidence.title,
      url: evidence.url,
      note: evidence.note,
      createdAt: evidence.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="page-shell">
      <header className="max-w-4xl pb-12 pt-14 md:pb-16 md:pt-20">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <Link
            href="/tools"
            className="text-xs uppercase tracking-[0.2em] text-moss transition hover:text-ink"
          >
            ← Tool shelf
          </Link>
          <Link
            href="/tools/today-compass"
            className="text-xs text-muted transition hover:text-ink"
          >
            Open Today Compass →
          </Link>
        </div>
        <p className="mt-12 text-xs uppercase tracking-[0.22em] text-lavender">
          An honest map of readiness
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-tight text-ink md:text-7xl">
          Interview Prep
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
          Track what you have touched, what you can explain, and what you can
          actually demonstrate. The gaps are not failures; they are directions.
        </p>
      </header>
      <InterviewPrepDashboard initialItems={items} />
    </div>
  );
}
