"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ActionCard,
  ActionSession,
  SessionStatus,
} from "@/lib/today-compass/types";

export function FocusTimer({
  action,
  session,
  onClose,
}: {
  action: ActionCard;
  session: ActionSession;
  onClose: () => void;
}) {
  const totalSeconds = session.plannedMinutes * 60;
  const [elapsed, setElapsed] = useState(session.elapsedSeconds);
  const [status, setStatus] = useState<SessionStatus>(session.status);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(session.note ?? "");
  const [noteSaved, setNoteSaved] = useState(false);
  const autoFinished = useRef(false);
  const elapsedRef = useRef(elapsed);
  elapsedRef.current = elapsed;

  const updateSession = useCallback(
    async (
      nextStatus: SessionStatus,
      nextElapsed = elapsed,
      nextNote?: string,
    ) => {
      setSaving(true);
      setError("");
      const response = await fetch(`/api/action-sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          elapsedSeconds: nextElapsed,
          ...(nextNote !== undefined ? { note: nextNote } : {}),
        }),
      });

      if (response.ok) {
        setElapsed(nextElapsed);
        setStatus(nextStatus);
        if (nextStatus === "completed") {
          window.dispatchEvent(new Event("compass-session-updated"));
        }
        setSaving(false);
        return true;
      } else {
        setError("The session could not be saved. Your timer is still here.");
      }
      setSaving(false);
      return false;
    },
    [elapsed, session.id],
  );

  useEffect(() => {
    if (status !== "running") return;

    const origin = Date.now() - elapsedRef.current * 1000;
    const tick = () => {
      setElapsed(
        Math.min(totalSeconds, Math.floor((Date.now() - origin) / 1000)),
      );
    };
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [status, totalSeconds]);

  useEffect(() => {
    if (
      elapsed >= totalSeconds &&
      status === "running" &&
      !autoFinished.current
    ) {
      autoFinished.current = true;
      void updateSession("completed", totalSeconds);
    }
  }, [elapsed, status, totalSeconds, updateSession]);

  const remaining = Math.max(0, totalSeconds - elapsed);
  const progress = Math.min(100, (elapsed / totalSeconds) * 100);
  const finished = status === "completed" || status === "abandoned";

  return (
    <section className="mb-10 overflow-hidden rounded-[2rem] border border-lavender/20 bg-white/65 shadow-soft backdrop-blur-sm">
      <div
        className="h-1 bg-lavender/70 transition-[width] duration-500"
        style={{ width: `${progress}%` }}
      />
      <div className="grid gap-8 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lavender">
            {status === "completed"
              ? "✦ Gently done"
              : status === "abandoned"
                ? "Session released"
                : "Today’s chosen action"}
          </p>
          <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">
            {action.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            {action.description}
          </p>
          <p className="mt-4 text-xs text-moss">{action.thread}</p>
        </div>

        <div className="min-w-48 text-left md:text-center">
          <p
            className="font-display text-6xl tabular-nums tracking-tight text-ink"
            aria-label={`${Math.ceil(remaining / 60)} minutes remaining`}
          >
            {formatTime(remaining)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
            {status === "paused"
              ? "Paused"
              : status === "running"
                ? "Remaining"
                : `${formatElapsed(elapsed)} focused`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 px-7 py-5 md:px-10">
        {!finished ? (
          <>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                updateSession(status === "running" ? "paused" : "running")
              }
              className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition hover:bg-moss disabled:opacity-50"
            >
              {status === "running" ? "Pause" : "Continue"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => updateSession("completed")}
              className="rounded-full border border-moss/20 px-5 py-2.5 text-sm text-moss transition hover:bg-moss/5 disabled:opacity-50"
            >
              ✦ Complete
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => updateSession("abandoned")}
              className="ml-auto text-sm text-muted hover:text-ink disabled:opacity-50"
            >
              Let this one go
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition hover:bg-moss"
          >
            Return to the compass
          </button>
        )}
        {error ? <p className="w-full text-xs text-red-700">{error}</p> : null}
      </div>
      {status === "completed" ? (
        <div className="border-t border-ink/10 px-7 py-6 md:px-10">
          <label className="block max-w-2xl">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-moss">
              A note for your future self
            </span>
            <textarea
              rows={3}
              maxLength={2000}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setNoteSaved(false);
              }}
              placeholder="What moved? What did you notice? What might come next?"
              className="w-full rounded-xl border border-ink/10 bg-paper/60 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-lavender/50"
            />
          </label>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                const saved = await updateSession("completed", elapsed, note);
                setNoteSaved(saved);
              }}
              className="rounded-full border border-moss/20 px-4 py-2 text-sm text-moss transition hover:bg-moss/5 disabled:opacity-50"
            >
              Save note
            </button>
            {noteSaved ? (
              <span className="text-xs text-muted">Saved to this session.</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function formatElapsed(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
