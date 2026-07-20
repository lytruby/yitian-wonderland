export type PrepTrack = "leetcode" | "frontend" | "system_design";
export type PrepStatus =
  | "untouched"
  | "need_review"
  | "can_explain"
  | "can_demonstrate";
export type PrepPriority = "normal" | "important" | "focus";

export type PrepEvidence = {
  id: string;
  title: string;
  url: string | null;
  note: string | null;
  createdAt: string;
};

export type PrepItem = {
  id: string;
  track: PrepTrack;
  section: string;
  title: string;
  description: string | null;
  sourceUrl: string | null;
  difficulty: string | null;
  status: PrepStatus;
  priority: PrepPriority;
  notes: string;
  lastReviewedAt: string | null;
  sortOrder: number;
  questionCount: number;
  evidence: PrepEvidence[];
};
