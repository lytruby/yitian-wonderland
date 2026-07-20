"use client";

import { useEffect, useMemo, useState } from "react";
import { routine } from "@/content/routine";
import { REMINDER_STORAGE_KEY } from "./ReminderWatcher";

const toneStyles = {
  deep: "border-lavender/25 bg-lavender/5 text-lavender",
  light: "border-moss/20 bg-moss/5 text-moss",
  life: "border-sky-200/60 bg-sky-50/40 text-sky-700",
  rest: "border-ink/10 bg-white/30 text-muted",
};

export function RoutineBoard() {
  const [now, setNow] = useState<Date | null>(null);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setNow(new Date());
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    setRemindersEnabled(
      window.localStorage.getItem(REMINDER_STORAGE_KEY) === "on",
    );
    const interval = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const timing = useMemo(() => {
    if (!now) return null;
    const minute = now.getHours() * 60 + now.getMinutes();
    const second = now.getSeconds();
    const next =
      routine.find((block) => block.minute * 60 > minute * 60 + second) ??
      routine[0];
    const nextIsTomorrow = next === routine[0] && minute >= 1440;
    const nextSeconds =
      next.minute * 60 -
      minute * 60 -
      second +
      (nextIsTomorrow ? 24 * 60 * 60 : 0);
    const current =
      [...routine]
        .reverse()
        .find((block) => block.minute <= minute && block.minute < 1440) ??
      routine[routine.length - 1];

    return { current, next, nextSeconds };
  }, [now]);

  async function enableReminders() {
    setMessage("");
    if (!("Notification" in window)) {
      setMessage("This browser does not support system notifications.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      window.localStorage.setItem(REMINDER_STORAGE_KEY, "on");
      setRemindersEnabled(true);
      setMessage("Reminder mode is on for this device.");
    } else {
      setMessage("Notification permission was not granted.");
    }
  }

  function disableReminders() {
    window.localStorage.setItem(REMINDER_STORAGE_KEY, "off");
    setRemindersEnabled(false);
    setMessage("Reminder mode is off.");
  }

  return (
    <>
      <section className="mb-12 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/80 bg-white/50 p-7 shadow-soft md:p-9">
          <p className="text-xs uppercase tracking-[0.2em] text-moss">
            Right now
          </p>
          <h2 className="mt-3 font-display text-4xl text-ink">
            {timing?.current.title ?? "Finding the hour…"}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            {timing?.current.description}
          </p>
          {timing ? (
            <p className="mt-7 border-t border-ink/10 pt-5 text-sm text-moss">
              Next: {timing.next.title} at {timing.next.time} ·{" "}
              {formatCountdown(timing.nextSeconds)}
            </p>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-lavender/20 bg-lavender/5 p-7 md:p-9">
          <p className="text-xs uppercase tracking-[0.2em] text-lavender">
            Reminder mode
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Receive a quiet system notification when each block begins. Keep
            this site open in a browser tab.
          </p>
          <button
            type="button"
            onClick={remindersEnabled ? disableReminders : enableReminders}
            className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition hover:bg-moss"
          >
            {remindersEnabled ? "Turn reminders off" : "Turn reminders on"}
          </button>
          <p className="mt-3 text-xs text-muted">
            {message ||
              (permission === "denied"
                ? "Notifications are blocked in browser settings."
                : remindersEnabled
                  ? "On for this device."
                  : "Off for this device.")}
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="space-y-3">
          {routine.map((block) => {
            const isCurrent = timing?.current.time === block.time;
            return (
              <article
                key={block.time}
                className={`grid gap-4 rounded-2xl border p-5 transition md:grid-cols-[6rem_1fr_auto] md:items-center ${
                  isCurrent
                    ? "border-lavender/35 bg-white/70 shadow-soft"
                    : "border-white/80 bg-white/35"
                }`}
              >
                <time className="font-display text-2xl text-ink">
                  {block.time}
                </time>
                <div>
                  <h3 className="font-display text-xl text-ink">
                    {block.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {block.description}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.13em] ${toneStyles[block.tone]}`}
                >
                  {block.tone}
                </span>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

function formatCountdown(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}
