import { PrismaClient } from "@prisma/client";

import { seedActivities } from "../lib/activities";
import { seedFoodOptions } from "../lib/food-options";

const CONFIRM = "YES_RESEED_CATALOG";

if (process.env.CONFIRM_RESEED_CATALOG !== CONFIRM) {
  console.error(
    `Refusing to reseed. Run with CONFIRM_RESEED_CATALOG=${CONFIRM} (replaces all activities & food options; clears swipes & food selections).`,
  );
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.swipe.deleteMany();
    await tx.foodSelection.deleteMany();
    await tx.activity.deleteMany();
    await tx.foodOption.deleteMany();

    await tx.activity.createMany({
      data: seedActivities.map((activity, index) => ({
        title: activity.title,
        description: activity.description ?? null,
        category: activity.category ?? null,
        imageUrl: activity.imageUrl ?? null,
        activityUrl: activity.activityUrl ?? null,
        includedInStay: activity.includedInStay ?? null,
        sortOrder: index,
      })),
    });

    await tx.foodOption.createMany({
      data: seedFoodOptions.map((option, index) => ({
        title: option.title,
        description: option.description ?? null,
        infoUrl: option.infoUrl ?? null,
        sortOrder: index,
      })),
    });
  });

  console.log(
    `Reseeded ${seedActivities.length} activities and ${seedFoodOptions.length} food options.`,
  );
}

main()
  .catch((error) => {
    console.error("reseed-catalog failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
