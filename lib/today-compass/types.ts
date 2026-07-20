export type Energy = "low" | "medium" | "high";
export type Focus = "build" | "learn" | "reflect" | "life";
export type ActionCategory = "interview" | "life" | "exercise" | "content";
export type AvailableTime = 15 | 30 | 45 | 60 | 90;

export type CompassInput = {
  energy: Energy;
  minutes: AvailableTime;
  focus: Focus;
};

export type ActionCard = {
  id: string;
  title: string;
  description: string;
  minutes: AvailableTime;
  energy: Energy;
  focus: Focus;
  category: ActionCategory;
  thread: string;
};

export type Recommendation = {
  action: ActionCard;
  reason: string;
  score: number;
};

export type SessionStatus = "running" | "paused" | "completed" | "abandoned";

export type ActionSession = {
  id: string;
  actionCardId: string;
  plannedMinutes: number;
  elapsedSeconds: number;
  status: SessionStatus;
  note: string | null;
  startedAt: string;
  completedAt: string | null;
};

export type CompletedSession = ActionSession & {
  actionCard: Pick<ActionCard, "id" | "title" | "thread">;
};
