const { PrismaClient } = require("@prisma/client");
const { frontendNotes } = require("./frontend-notes");

const prisma = new PrismaClient();

async function seedFrontendNotes() {
  for (const [id, notes] of Object.entries(frontendNotes)) {
    await prisma.prepItem.updateMany({
      where: { id, notes: "" },
      data: { notes },
    });
  }

  console.log(
    `Frontend study notes ready: ${Object.keys(frontendNotes).length}`,
  );
}

seedFrontendNotes()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
