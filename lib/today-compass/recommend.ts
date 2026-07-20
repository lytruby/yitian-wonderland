import type {
  ActionCard,
  CompassInput,
  Energy,
  Recommendation,
} from "./types";

const energyValue: Record<Energy, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function recommendActions(
  actions: ActionCard[],
  input: CompassInput,
  count = 3,
): Recommendation[] {
  return actions
    .filter((action) => action.minutes <= input.minutes)
    .map((action) => {
      const energyGap =
        energyValue[input.energy] - energyValue[action.energy];
      let score = action.focus === input.focus ? 6 : 0;

      score += energyGap === 0 ? 4 : energyGap > 0 ? 2 : -4;
      score += action.minutes === input.minutes ? 3 : 1;
      score += action.minutes <= 30 ? 1 : 0;

      const reason =
        action.focus === input.focus
          ? `Matches your ${input.focus} focus and fits inside ${input.minutes} minutes.`
          : `A gentle counterweight that fits your time and ${input.energy} energy.`;

      return { action, reason, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.action.minutes - a.action.minutes ||
        a.action.title.localeCompare(b.action.title),
    )
    .slice(0, count);
}
