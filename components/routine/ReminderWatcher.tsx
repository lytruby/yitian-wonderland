"use client";

import { useEffect } from "react";
import { routine } from "@/content/routine";

export const REMINDER_STORAGE_KEY = "yitian-routine-reminders";

export function ReminderWatcher() {
  useEffect(() => {
    function checkRoutine() {
      if (
        window.localStorage.getItem(REMINDER_STORAGE_KEY) !== "on" ||
        !("Notification" in window) ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}`;
      const block = routine.find((item) => item.time === currentTime);
      if (!block) return;

      const notificationKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${block.time}`;
      const lastNotification = window.localStorage.getItem(
        "yitian-last-routine-notification",
      );
      if (lastNotification === notificationKey) return;

      new Notification(block.title, {
        body: block.description,
        icon: "/favicon.ico",
        tag: `routine-${block.time}`,
      });
      window.localStorage.setItem(
        "yitian-last-routine-notification",
        notificationKey,
      );
    }

    checkRoutine();
    const interval = window.setInterval(checkRoutine, 15_000);
    return () => window.clearInterval(interval);
  }, []);

  return null;
}
