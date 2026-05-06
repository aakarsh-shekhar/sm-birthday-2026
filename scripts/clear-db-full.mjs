/**
 * Wipes the entire database: participants (and cascaded data), activities, food options.
 *
 * Run: CONFIRM_CLEAR_DB_FULL=YES_CLEAR_DB_FULL node scripts/clear-db-full.mjs
 */
import { PrismaClient } from "@prisma/client";

const CONFIRM_VALUE = "YES_CLEAR_DB_FULL";

if (process.env.CONFIRM_CLEAR_DB_FULL !== CONFIRM_VALUE) {
  console.error(
    `Refusing to wipe database. Re-run with CONFIRM_CLEAR_DB_FULL=${CONFIRM_VALUE}`,
  );
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.participant.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.foodOption.deleteMany(),
  ]);

  console.log(
    "Full wipe complete. Participants (and cascaded swipes, food selections, grocery items/notes, easter eggs), all activities, and all food options removed.",
  );
}

main()
  .catch((error) => {
    console.error("clear-db-full failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
