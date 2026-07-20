const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const actions = [
  ["Sketch the next Compass flow", "Draw the smallest useful journey from checking in to choosing an action.", 30, "medium", "build", "Today Compass"],
  ["Ship one tiny improvement", "Pick one visible rough edge in the personal lab and make it noticeably better.", 45, "high", "build", "Yitian’s Lab"],
  ["Read one agent workflow case", "Find one practical pattern and capture only the part worth trying.", 30, "medium", "learn", "Agentic workflows"],
  ["Make a question list", "Write down five questions that currently feel more alive than their answers.", 15, "low", "reflect", "Unfinished questions"],
  ["Tend one unfinished note", "Open a fragment, add three honest sentences, and leave it slightly more alive.", 30, "low", "reflect", "Digital garden"],
  ["Take a noticing walk", "Walk without input and bring back three details you would normally miss.", 45, "medium", "life", "Everyday attention"],
  ["Reset one small space", "Clear a single surface or folder until it feels quiet enough to begin again.", 15, "low", "life", "Tiny systems for living"],
  ["Prototype one recommendation rule", "Turn one intuition about energy or time into a testable decision rule.", 60, "high", "build", "Today Compass"],
  ["Map a tool you admire", "Notice its core promise, its restraint, and one choice you would borrow.", 45, "medium", "learn", "Toolmaking"],
  ["Trace the week so far", "List what moved, what lingered, and what quietly stopped mattering.", 30, "low", "reflect", "Weekly review"],
  ["Open the day", "Empty your head, review your current threads, and choose the three things that would make today feel meaningfully moved.", 15, "low", "reflect", "Daily orientation"],
  ["Catch one publishable idea", "Turn one observation, question, or unfinished thought into a clear content seed worth returning to.", 15, "low", "reflect", "Content practice"],
  ["Shape one idea into an outline", "Give one content seed a hook, three useful points, and a closing thought. Stop before polishing.", 30, "medium", "build", "Content practice"],
  ["Write the honest first draft", "Draft one piece from beginning to end without editing every sentence while it is still becoming.", 45, "medium", "build", "Content practice"],
  ["Publish one useful thing", "Make the final necessary edits, choose a simple title or cover, and let one finished piece leave the nest.", 45, "high", "build", "Content practice"],
  ["Notice what resonated", "Review recent responses and capture one signal about what felt useful, alive, or worth exploring next.", 30, "low", "learn", "Content practice"],
  ["欧阳春晓芭杆沙漏腰", "Complete the 45-minute barre hourglass-waist session with steady form and controlled breathing.", 45, "medium", "life", "Movement practice"],
  ["Pump It Up 体能部分", "Complete the 45-minute Pump It Up conditioning section and let the goal be movement, not perfection.", 45, "high", "life", "Movement practice"],
  ["写手帐", "Spend 30 quiet minutes recording the day, arranging thoughts, and leaving a small visual trace of what mattered.", 30, "low", "reflect", "Personal reflection"],
];

const categoryByTitle = {
  "Sketch the next Compass flow": "content",
  "Ship one tiny improvement": "content",
  "Read one agent workflow case": "interview",
  "Make a question list": "life",
  "Tend one unfinished note": "content",
  "Take a noticing walk": "exercise",
  "Reset one small space": "life",
  "Prototype one recommendation rule": "content",
  "Map a tool you admire": "content",
  "Trace the week so far": "life",
  "Open the day": "life",
  "Catch one publishable idea": "content",
  "Shape one idea into an outline": "content",
  "Write the honest first draft": "content",
  "Publish one useful thing": "content",
  "Notice what resonated": "content",
  "欧阳春晓芭杆沙漏腰": "exercise",
  "Pump It Up 体能部分": "exercise",
  "写手帐": "life",
};

async function main() {
  const count = await prisma.actionCard.count();

  if (count > 0) {
    console.log(`Skipped seed: ${count} action cards already exist.`);
    return;
  }

  await prisma.actionCard.createMany({
    data: actions.map(([title, description, minutes, energy, focus, thread]) => ({
      title,
      description,
      minutes,
      energy,
      focus,
      thread,
      category: categoryByTitle[title] ?? "life",
    })),
  });

  console.log(`Seeded ${actions.length} action cards.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
