import type { Metadata } from "next";
import Link from "next/link";
import { CockpitNav } from "@/components/cockpit/CockpitNav";
import { prisma } from "@/lib/prisma";
import { SessionRemark } from "@/components/today-compass/SessionRemark";

export const metadata: Metadata = {
  title: "History",
  description: "A daily trail of completed action cards.",
};

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  interview: "Interview Prep",
  life: "Life",
  exercise: "Exercise",
  content: "Content Creation",
};

export default async function HistoryPage() {
  const sessions = await prisma.actionSession.findMany({
    where: { status: "completed" },
    include: {
      actionCard: {
        select: {
          title: true,
          thread: true,
          category: true,
        },
      },
    },
    orderBy: { completedAt: "desc" },
  });

  const groups = new Map<string, typeof sessions>();
  sessions.forEach((session) => {
    const date = session.completedAt ?? session.startedAt;
    const key = singaporeDateKey(date);
    groups.set(key, [...(groups.get(key) ?? []), session]);
  });

  const totalSeconds = sessions.reduce(
    (sum, session) => sum + session.elapsedSeconds,
    0,
  );

  return (
    <div className="page-shell">
      <CockpitNav />
      <header className="page-intro">
        <p className="!mt-0 !text-xs uppercase !tracking-[0.22em] !text-moss">
          Gentle evidence
        </p>
        <h1>History</h1>
        <p>
          A day-by-day trail of things that moved. Not a scoreboard—just a
          record of the small promises you kept.
        </p>
      </header>

      <div className="mb-14 grid gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 sm:grid-cols-3">
        <Summary value={String(sessions.length)} label="completed actions" />
        <Summary value={String(groups.size)} label="active days" />
        <Summary
          value={
            totalSeconds === 0 && sessions.length > 0
              ? "Not tracked"
              : formatTotalTime(totalSeconds)
          }
          label="focused time"
        />
      </div>

      {groups.size === 0 ? (
        <div className="mb-20 rounded-[2rem] border border-dashed border-lavender/30 px-7 py-16 text-center">
          <p className="font-display text-3xl text-ink">
            The trail begins with one small thing.
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted">
            Complete a timed action or add a card directly to today. It will
            appear here.
          </p>
          <Link
            href="/tools/today-compass"
            className="mt-7 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition hover:bg-moss"
          >
            Open Today Compass
          </Link>
        </div>
      ) : (
        <div className="space-y-14 pb-20">
          {Array.from(groups.entries()).map(([date, items]) => (
            <section
              key={date}
              className="grid gap-6 border-t border-ink/10 pt-8 md:grid-cols-[12rem_1fr]"
            >
              <div>
                <h2 className="font-display text-2xl text-ink">
                  {formatDateHeading(date)}
                </h2>
                <p className="mt-2 text-xs text-muted">
                  {items.length} {items.length === 1 ? "action" : "actions"}
                </p>
              </div>

              <div className="space-y-4">
                {items.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-[1.5rem] border border-white/80 bg-white/45 p-6 shadow-soft"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-2xl text-ink">
                            {session.actionCard.title}
                          </h3>
                          <span className="rounded-full bg-lavender/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.12em] text-lavender">
                            {categoryLabels[session.actionCard.category] ??
                              session.actionCard.category}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-moss">
                          {session.actionCard.thread}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="status-pill">
                          {formatFocusTime(session.elapsedSeconds)}
                        </span>
                        <p className="mt-2 text-xs text-muted">
                          {formatCompletionTime(
                            session.completedAt ?? session.startedAt,
                          )}
                        </p>
                      </div>
                    </div>

                    <SessionRemark
                      sessionId={session.id}
                      initialRemark={session.note}
                      elapsedSeconds={session.elapsedSeconds}
                    />
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-paper/90 p-6 md:p-8">
      <p className="font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </p>
    </div>
  );
}

function singaporeDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function formatDateHeading(date: string) {
  const today = singaporeDateKey(new Date());
  if (date === today) return "Today";

  return new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Singapore",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00+08:00`));
}

function formatCompletionTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Singapore",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatFocusTime(seconds: number) {
  if (seconds === 0) return "Logged manually";
  if (seconds < 60) return `${seconds}s focused`;
  return `${Math.floor(seconds / 60)}m focused`;
}

function formatTotalTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
