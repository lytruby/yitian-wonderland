"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CompletedSession } from "@/lib/today-compass/types";

export function TodaySummary() {
  const [sessions, setSessions] = useState<CompletedSession[]>([]);

  const load = useCallback(async () => {
    const response = await fetch("/api/action-sessions", { cache: "no-store" });
    if (response.ok) {
      setSessions((await response.json()) as CompletedSession[]);
    }
  }, []);

  useEffect(() => {
    void load();
    const refresh = () => void load();
    window.addEventListener("compass-session-updated", refresh);
    return () =>
      window.removeEventListener("compass-session-updated", refresh);
  }, [load]);

  const today = useMemo(() => {
    const key = localDateKey(new Date());
    const items = sessions.filter((session) => {
      const date = new Date(session.completedAt ?? session.startedAt);
      return localDateKey(date) === key;
    });
    return {
      items,
      count: items.length,
      untracked: items.filter((session) => session.elapsedSeconds === 0)
        .length,
      seconds: items.reduce(
        (sum, session) => sum + session.elapsedSeconds,
        0,
      ),
    };
  }, [sessions]);

  return (
    <section className="mb-12 rounded-[1.6rem] border border-white/80 bg-white/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-moss">
            Completed today
          </p>
          <p className="mt-2 font-display text-2xl text-ink">
            {today.count} {today.count === 1 ? "action" : "actions"} completed
            <span className="mx-2 text-lavender/50">·</span>
            {formatFocusSummary(today.seconds, today.untracked, today.count)}
          </p>
        </div>
        <div className="flex gap-5 text-sm">
          <Link href="/cards" className="text-muted transition hover:text-ink">
            Manage cards
          </Link>
          <Link href="/history" className="text-moss transition hover:text-ink">
            View history →
          </Link>
        </div>
      </div>

      {today.items.length > 0 ? (
        <div className="mt-6 grid gap-3 border-t border-ink/10 pt-5 sm:grid-cols-2">
          {today.items.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-white/80 bg-paper/55 px-4 py-3.5"
            >
              <p className="text-sm text-ink">
                {completionLabel(session)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {session.actionCard.title}
                <span className="mx-2 text-ink/20">·</span>
                {session.elapsedSeconds > 0
                  ? `${formatTime(session.elapsedSeconds)} tracked`
                  : "time not tracked"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 border-t border-ink/10 pt-5 text-sm text-muted">
          Nothing logged yet. The day is still open.
        </p>
      )}
    </section>
  );
}

function localDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatTime(seconds: number) {
  if (seconds < 60) return seconds === 0 ? "0m" : `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatFocusSummary(
  seconds: number,
  untracked: number,
  completed: number,
) {
  if (completed === 0) return "no focus recorded yet";
  if (seconds === 0) return "focus time not tracked";
  if (untracked > 0) {
    return `${formatTime(seconds)} tracked focus · ${untracked} untracked`;
  }
  return `${formatTime(seconds)} tracked focus`;
}

function completionLabel(session: CompletedSession) {
  if (!session.note) return session.actionCard.title;
  return session.note.split(/\s+—\s+https?:\/\//)[0] || session.actionCard.title;
}
