/*
  Warnings:

  - You are about to drop the column `isOver` on the `cycle` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `periodic` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "periodic" DROP CONSTRAINT "periodic_userId_fkey";

-- AlterTable
ALTER TABLE "cycle" DROP COLUMN "isOver",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "periodic" DROP COLUMN "userId";
