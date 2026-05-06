import { PrismaClient } from "@prisma/client";

const CONFIRM_VALUE = "YES_CLEAR_DB";

if (process.env.CONFIRM_CLEAR_DB !== CONFIRM_VALUE) {
  console.error(
    `Refusing to clear database. Re-run with CONFIRM_CLEAR_DB=${CONFIRM_VALUE}`,
  );
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  await prisma.swipe.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.activity.deleteMany();
  console.log("Database cleared: Swipe, Participant, Activity tables.");
}

main()
  .catch((error) => {
    console.error("Failed to clear database", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
