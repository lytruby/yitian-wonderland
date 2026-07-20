const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function migrateInterviewQuestions() {
  const evidence = await prisma.prepEvidence.findMany();

  for (const item of evidence) {
    const content = transformQuestion(item.note);
    await prisma.interviewQuestion.upsert({
      where: { id: `migrated-${item.id}` },
      create: {
        id: `migrated-${item.id}`,
        prepItemId: item.prepItemId,
        title: item.title,
        prompt: content.prompt ?? (item.url ? `Reference: ${item.url}` : null),
        code: content.code,
        language: content.code ? "javascript" : null,
        answer: content.answer,
        explanation: content.explanation,
        createdAt: item.createdAt,
      },
      update: content.code
        ? {
            prompt: content.prompt,
            code: content.code,
            language: "javascript",
            answer: content.answer,
            explanation: content.explanation,
          }
        : {},
    });
  }

  console.log(`Interview questions migrated: ${evidence.length}`);
}

function transformQuestion(note) {
  const value = note ?? "";
  const marker = "\n\n输出：";
  if (!value.includes(marker)) {
    return { prompt: null, code: null, answer: value, explanation: null };
  }

  const [code, result] = value.split(marker);
  const [answer, explanation] = result.split("\n顺序：");
  return {
    prompt: "下面代码的输出顺序是什么？",
    code: code.trim(),
    answer: answer.trim(),
    explanation: explanation?.trim() || null,
  };
}

migrateInterviewQuestions()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
