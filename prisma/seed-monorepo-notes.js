const { PrismaClient } = require("@prisma/client");
const { monorepoNotes } = require("./monorepo-notes");

const prisma = new PrismaClient();

async function seedMonorepoNotes() {
  for (const [id, notes] of Object.entries(monorepoNotes)) {
    await prisma.prepItem.update({
      where: { id },
      data: { notes },
    });
  }

  console.log(`Monorepo study notes ready: ${Object.keys(monorepoNotes).length}`);
}

seedMonorepoNotes()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
