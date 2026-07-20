"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SessionRemark } from "@/components/today-compass/SessionRemark";
import type { CompletedSession } from "@/lib/today-compass/types";

export function SessionHistory() {
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/action-sessions", { cache: "no-store" });

    if (response.ok) {
      setSessions((await response.json()) as CompletedSession[]);
      setError("");
    } else {
      setError("Your completed sessions could not be loaded.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const refresh = () => void load();
    window.addEventListener("compass-session-updated", refresh);
    return () =>
      window.removeEventListener("compass-session-updated", refresh);
  }, [load]);

  const groups = useMemo(() => {
    const grouped = new Map<string, CompletedSession[]>();
    sessions.forEach((session) => {
      const date = new Date(session.completedAt ?? session.startedAt);
      const key = localDateKey(date);
      grouped.set(key, [...(grouped.get(key) ?? []), session]);
    });
    return Array.from(grouped.entries());
  }, [sessions]);

  return (
    <section className="border-t border-ink/10 pb-20 pt-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
        <p className="text-xs uppercase tracking-[0.2em] text-moss">
          Gentle evidence
        </p>
        <h2 className="mt-2 font-display text-3xl text-ink">
          What you have completed
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          A daily trail of finished cards—not a scoreboard, just proof that
          things moved.
        </p>
        </div>
        <Link
          href="/history"
          className="text-sm text-moss transition hover:text-ink"
        >
          Open full history →
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Gathering the trail…</p>
      ) : error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-lavender/30 p-7 text-sm text-muted">
          Completed actions will gather here, one day at a time.
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map(([date, items]) => (
            <div key={date} className="grid gap-4 md:grid-cols-[10rem_1fr]">
              <div>
                <p className="font-display text-xl text-ink">
                  {formatDay(date)}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {items.length} {items.length === 1 ? "action" : "actions"}
                </p>
              </div>
              <div className="space-y-3">
                {items.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-2xl border border-white/80 bg-white/40 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl text-ink">
                          {session.actionCard.title}
                        </h3>
                        <p className="mt-1 text-xs text-moss">
                          {session.actionCard.thread}
                        </p>
                      </div>
                      <span className="status-pill">
                        {formatFocusTime(session.elapsedSeconds)}
                      </span>
                    </div>
                    <SessionRemark
                      sessionId={session.id}
                      initialRemark={session.note}
                      elapsedSeconds={session.elapsedSeconds}
                    />
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDay(date: string) {
  const value = new Date(`${date}T00:00:00`);
  const today = new Date();
  const todayKey = localDateKey(today);

  if (date === todayKey) return "Today";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: value.getFullYear() === today.getFullYear() ? undefined : "numeric",
  }).format(value);
}

function localDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatFocusTime(seconds: number) {
  if (seconds === 0) return "Logged manually";
  if (seconds < 60) return `${seconds}s focused`;
  return `${Math.floor(seconds / 60)}m focused`;
}
