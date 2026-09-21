-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN "difficulty" TEXT NOT NULL DEFAULT 'Intermediate';
ALTER TABLE "InterviewSession" ADD COLUMN "questionCount" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "InterviewSession" ADD COLUMN "overallScore" INTEGER;
ALTER TABLE "InterviewSession" ADD COLUMN "overallFeedback" TEXT;
