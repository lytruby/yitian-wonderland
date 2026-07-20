export type RoleTrack = "AI Product" | "Developer Tools" | "Risk Platform" | "AI Evaluation";

export type JobMode = "Remote" | "Singapore" | "Hybrid · Singapore";

export type JobOpportunity = {
  id: string;
  title: string;
  company: string;
  track: RoleTrack;
  mode: JobMode;
  compensation: string;
  compensationMin: number | null;
  sourceUrl: string;
  sourceLabel: string;
  match: number;
  posted: string;
  summary: string;
  signals: string[];
  gaps: string[];
  reasons: string[];
  searchQuery: string;
};
