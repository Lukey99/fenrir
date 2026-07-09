-- AlterTable
ALTER TABLE "ProgramDay" ADD COLUMN     "preferredWeekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
