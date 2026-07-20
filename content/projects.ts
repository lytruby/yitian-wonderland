import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    title: "Today Compass",
    description:
      "A small personal operating tool that helps me decide what to do today based on my energy, time, and current life threads.",
    status: "Building",
    longDescription:
      "Today Compass reads action cards from Obsidian and recommends a few grounded actions for the day. It is less about productivity and more about finding the next gentle step inside a noisy mind.",
  },
  {
    title: "AI Finance Report Skill",
    description:
      "A workflow experiment that turns repetitive finance reporting work into a semi-automated AI-assisted process.",
    status: "Prototype",
    longDescription:
      "Built from a real finance reporting need, this experiment extracts financial data from audit reports and generates structured Excel and Word analysis drafts.",
  },
];
