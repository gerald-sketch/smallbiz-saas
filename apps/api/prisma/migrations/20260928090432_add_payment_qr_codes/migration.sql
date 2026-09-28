/*
  Warnings:

  - The values [CARD,BANK_TRANSFER] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'GCASH', 'MAYA');
ALTER TABLE "Sale" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "gcashQrUrl" TEXT,
ADD COLUMN     "mayaQrUrl" TEXT;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "paymentReference" TEXT;
