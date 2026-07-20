export type RoutineBlock = {
  time: string;
  minute: number;
  title: string;
  description: string;
  tone: "deep" | "light" | "life" | "rest";
};

export const routine: RoutineBlock[] = [
  {
    time: "09:00",
    minute: 540,
    title: "Wake gently",
    description:
      "Wash up, have breakfast, and take an optional short walk while the morning is still softer.",
    tone: "life",
  },
  {
    time: "09:30",
    minute: 570,
    title: "Open the day",
    description: "Choose what belongs in today’s three working blocks.",
    tone: "light",
  },
  {
    time: "10:00",
    minute: 600,
    title: "Deep block A",
    description: "Protect the clearest hours for the hardest important thing.",
    tone: "deep",
  },
  {
    time: "12:00",
    minute: 720,
    title: "Lunch & indoor reset",
    description:
      "Eat, cool down, and rest indoors through the hottest part of the day.",
    tone: "life",
  },
  {
    time: "14:00",
    minute: 840,
    title: "Deep block B",
    description: "A second focused block for practice or meaningful progress.",
    tone: "deep",
  },
  {
    time: "15:30",
    minute: 930,
    title: "Real break",
    description: "Step away from the screen without turning the break into input.",
    tone: "rest",
  },
  {
    time: "16:00",
    minute: 960,
    title: "Move at home",
    description:
      "Stretch, follow a workout, or move indoors without negotiating with the heat.",
    tone: "life",
  },
  {
    time: "17:00",
    minute: 1020,
    title: "Light block C",
    description:
      "Review, organize, or finish one low-pressure task before going out.",
    tone: "light",
  },
  {
    time: "17:30",
    minute: 1050,
    title: "Evening walk",
    description:
      "Step outside as the heat begins to loosen and reconnect with the world.",
    tone: "life",
  },
  {
    time: "19:00",
    minute: 1140,
    title: "Evening belongs to life",
    description: "Dinner, people, curiosity, and time that does not need to perform.",
    tone: "life",
  },
  {
    time: "21:30",
    minute: 1290,
    title: "Close the day",
    description: "Leave a short remark and release what did not happen.",
    tone: "light",
  },
  {
    time: "23:30",
    minute: 1410,
    title: "Wind down",
    description: "Wash up, dim the lights, and stop solving tomorrow.",
    tone: "rest",
  },
  {
    time: "00:00",
    minute: 1440,
    title: "Sleep",
    description: "The day is complete.",
    tone: "rest",
  },
];
