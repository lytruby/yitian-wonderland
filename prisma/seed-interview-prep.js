const { PrismaClient } = require("@prisma/client");
const { prepItems } = require("./interview-prep-data");

const prisma = new PrismaClient();

async function seedInterviewPrep() {
  for (const item of prepItems) {
    await prisma.prepItem.upsert({
      where: { id: item.id },
      update: {
        track: item.track,
        section: item.section,
        title: item.title,
        description: item.description,
        sourceUrl: item.sourceUrl,
        difficulty: item.difficulty,
        sortOrder: item.sortOrder,
      },
      create: item,
    });
  }

  console.log(`Interview prep items ready: ${prepItems.length}`);
}

seedInterviewPrep()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
