/*
  Warnings:

  - You are about to drop the column `transaction_type` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_type` on the `transaction` table. All the data in the column will be lost.
  - Added the required column `transactionType` to the `category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "category" DROP COLUMN "transaction_type",
ADD COLUMN     "transactionType" "Transaction_T" NOT NULL;

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "transaction_type",
ADD COLUMN     "transactionType" "Transaction_T";
