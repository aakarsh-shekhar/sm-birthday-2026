-- AlterTable
ALTER TABLE "Participant" ADD COLUMN "swipeReviewCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Participant" ADD COLUMN "foodPicksSubmitted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Participant" ADD COLUMN "flowFinished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Participant" ADD COLUMN "skippedToGrocery" BOOLEAN NOT NULL DEFAULT false;

-- Legacy: everyone who already finished all activity swipes had no review step; treat review as done.
UPDATE "Participant" p
SET "swipeReviewCompleted" = TRUE
WHERE (SELECT COUNT(*)::int FROM "Activity") > 0
  AND (
    SELECT COUNT(*)::int FROM "Swipe" s WHERE s."participantId" = p.id
  ) = (SELECT COUNT(*)::int FROM "Activity");

-- Legacy: anyone with saved food picks has completed the food screen.
UPDATE "Participant" p
SET "foodPicksSubmitted" = TRUE
WHERE EXISTS (SELECT 1 FROM "FoodSelection" f WHERE f."participantId" = p.id);
