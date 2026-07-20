import type { ActionCard } from "@/lib/today-compass/types";

export const actionCards: ActionCard[] = [
  {
    id: "compass-flow",
    title: "Sketch the next Compass flow",
    description:
      "Draw the smallest useful journey from checking in to choosing an action.",
    minutes: 30,
    energy: "medium",
    focus: "build",
    category: "content",
    thread: "Today Compass",
  },
  {
    id: "tiny-ship",
    title: "Ship one tiny improvement",
    description:
      "Pick one visible rough edge in the personal lab and make it noticeably better.",
    minutes: 45,
    energy: "high",
    focus: "build",
    category: "content",
    thread: "Yitian’s Lab",
  },
  {
    id: "read-agent",
    title: "Read one agent workflow case",
    description:
      "Find one practical pattern and capture only the part worth trying.",
    minutes: 30,
    energy: "medium",
    focus: "learn",
    category: "interview",
    thread: "Agentic workflows",
  },
  {
    id: "question-list",
    title: "Make a question list",
    description:
      "Write down five questions that currently feel more alive than their answers.",
    minutes: 15,
    energy: "low",
    focus: "reflect",
    category: "life",
    thread: "Unfinished questions",
  },
  {
    id: "garden-note",
    title: "Tend one unfinished note",
    description:
      "Open a fragment, add three honest sentences, and leave it slightly more alive.",
    minutes: 30,
    energy: "low",
    focus: "reflect",
    category: "content",
    thread: "Digital garden",
  },
  {
    id: "walk-notice",
    title: "Take a noticing walk",
    description:
      "Walk without input and bring back three details you would normally miss.",
    minutes: 45,
    energy: "medium",
    focus: "life",
    category: "exercise",
    thread: "Everyday attention",
  },
  {
    id: "reset-space",
    title: "Reset one small space",
    description:
      "Clear a single surface or folder until it feels quiet enough to begin again.",
    minutes: 15,
    energy: "low",
    focus: "life",
    category: "life",
    thread: "Tiny systems for living",
  },
  {
    id: "prototype-rule",
    title: "Prototype one recommendation rule",
    description:
      "Turn one intuition about energy or time into a testable decision rule.",
    minutes: 60,
    energy: "high",
    focus: "build",
    category: "content",
    thread: "Today Compass",
  },
  {
    id: "tool-map",
    title: "Map a tool you admire",
    description:
      "Notice its core promise, its restraint, and one choice you would borrow.",
    minutes: 45,
    energy: "medium",
    focus: "learn",
    category: "content",
    thread: "Toolmaking",
  },
  {
    id: "weekly-trace",
    title: "Trace the week so far",
    description:
      "List what moved, what lingered, and what quietly stopped mattering.",
    minutes: 30,
    energy: "low",
    focus: "reflect",
    category: "life",
    thread: "Weekly review",
  },
];
