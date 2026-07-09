-- CreateIndex
CREATE INDEX "ProgramDay_preferredWeekdays_idx" ON "ProgramDay" USING GIN ("preferredWeekdays");
