/*
  Warnings:

  - You are about to drop the column `cycleId` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `descrition` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the `cycle` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Cycle_T" AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'yearly', 'customDays');

-- DropForeignKey
ALTER TABLE "cycle" DROP CONSTRAINT "cycle_userId_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_cycleId_fkey";

-- DropIndex
DROP INDEX "transaction_cycleId_idx";

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "cycleId",
DROP COLUMN "descrition",
ADD COLUMN     "description" TEXT NOT NULL;

-- DropTable
DROP TABLE "cycle";

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags_on_transactions" (
    "tagId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "tags_on_transactions_pkey" PRIMARY KEY ("tagId","transactionId")
);

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_transactions" ADD CONSTRAINT "tags_on_transactions_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_transactions" ADD CONSTRAINT "tags_on_transactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
