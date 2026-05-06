-- CreateTable
CREATE TABLE "EasterEggFind" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "eggKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EasterEggFind_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EasterEggFind_participantId_eggKey_key" ON "EasterEggFind"("participantId", "eggKey");

-- AddForeignKey
ALTER TABLE "EasterEggFind" ADD CONSTRAINT "EasterEggFind_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
