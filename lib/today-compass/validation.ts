import type {
  AvailableTime,
  ActionCategory,
  Energy,
  Focus,
} from "@/lib/today-compass/types";

const energies: Energy[] = ["low", "medium", "high"];
const focuses: Focus[] = ["build", "learn", "reflect", "life"];
const times: AvailableTime[] = [15, 30, 45, 60, 90];
const categories: ActionCategory[] = [
  "interview",
  "life",
  "exercise",
  "content",
];

export function parseActionCard(body: unknown) {
  if (!body || typeof body !== "object") return null;

  const value = body as Record<string, unknown>;
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const description =
    typeof value.description === "string" ? value.description.trim() : "";
  const thread = typeof value.thread === "string" ? value.thread.trim() : "";
  const minutes = Number(value.minutes) as AvailableTime;
  const energy = value.energy as Energy;
  const focus = value.focus as Focus;
  const category = value.category as ActionCategory;

  if (
    !title ||
    !description ||
    !thread ||
    !times.includes(minutes) ||
    !energies.includes(energy) ||
    !focuses.includes(focus) ||
    !categories.includes(category)
  ) {
    return null;
  }

  return { title, description, thread, minutes, energy, focus, category };
}
