/*
  Warnings:

  - You are about to drop the column `uplineUserId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "uplineUserId",
ADD COLUMN     "picture" TEXT;
