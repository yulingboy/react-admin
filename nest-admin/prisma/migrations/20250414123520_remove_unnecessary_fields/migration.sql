/*
  Warnings:

  - You are about to drop the column `functionAuthor` on the `CodeGenerator` table. All the data in the column will be lost.
  - You are about to drop the column `functionName` on the `CodeGenerator` table. All the data in the column will be lost.
  - You are about to drop the column `packageName` on the `CodeGenerator` table. All the data in the column will be lost.
  - You are about to drop the column `tablePrefix` on the `CodeGenerator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CodeGenerator` DROP COLUMN `functionAuthor`,
    DROP COLUMN `functionName`,
    DROP COLUMN `packageName`,
    DROP COLUMN `tablePrefix`;
