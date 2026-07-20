const { PrismaClient } = require("@prisma/client");
const { prepItems } = require("./interview-prep-data");

const prisma = new PrismaClient();

const legacyProblemSources = {
  "leetcode-problem-27": "leetcode-patterns-3",
  "leetcode-problem-209": "leetcode-patterns-4",
  "leetcode-problem-20": "leetcode-patterns-5",
  "leetcode-problem-94": "leetcode-patterns-9",
};

async function migrateLeetcodeProblems() {
  const problems = prepItems.filter((item) => item.track === "leetcode");

  for (const problem of problems) {
    const existing = await prisma.prepItem.findUnique({
      where: { id: problem.id },
    });
    const legacyId = legacyProblemSources[problem.id];
    const legacy = legacyId
      ? await prisma.prepItem.findUnique({
          where: { id: legacyId },
          include: { evidence: true },
        })
      : null;
    const matchingEvidence = legacy?.evidence.find(
      (evidence) => evidence.url === problem.sourceUrl,
    );
    const noteCandidates = [existing?.notes, legacy?.notes, problem.notes]
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    let migratedNotes = noteCandidates[0] ?? "";
    if (
      matchingEvidence?.note &&
      !migratedNotes.includes(matchingEvidence.note)
    ) {
      migratedNotes = [migratedNotes, matchingEvidence.note]
        .filter(Boolean)
        .join("\n\n");
    }

    await prisma.prepItem.upsert({
      where: { id: problem.id },
      create: {
        ...problem,
        notes: migratedNotes,
        lastReviewedAt:
          legacy?.lastReviewedAt ?? matchingEvidence?.createdAt ?? new Date(),
      },
      update: {
        section: problem.section,
        title: problem.title,
        sourceUrl: problem.sourceUrl,
        notes: migratedNotes,
        status: legacy?.status ?? existing?.status ?? problem.status,
        priority: legacy?.priority ?? existing?.priority ?? "normal",
        lastReviewedAt:
          legacy?.lastReviewedAt ??
          existing?.lastReviewedAt ??
          matchingEvidence?.createdAt ??
          new Date(),
        sortOrder: problem.sortOrder,
      },
    });
  }

  await prisma.prepItem.deleteMany({
    where: {
      track: "leetcode",
      id: { notIn: problems.map((problem) => problem.id) },
    },
  });

  console.log(`LeetCode problems migrated: ${problems.length}`);
}

migrateLeetcodeProblems()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
