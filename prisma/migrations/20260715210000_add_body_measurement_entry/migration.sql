-- CreateTable
CREATE TABLE "BodyMeasurementEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "waistCm" DECIMAL(5,2),
    "chestCm" DECIMAL(5,2),
    "hipsCm" DECIMAL(5,2),
    "armCm" DECIMAL(5,2),
    "thighCm" DECIMAL(5,2),
    "calfCm" DECIMAL(5,2),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyMeasurementEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BodyMeasurementEntry_userId_date_idx" ON "BodyMeasurementEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "BodyMeasurementEntry_userId_date_key" ON "BodyMeasurementEntry"("userId", "date");

-- AddForeignKey
ALTER TABLE "BodyMeasurementEntry" ADD CONSTRAINT "BodyMeasurementEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
