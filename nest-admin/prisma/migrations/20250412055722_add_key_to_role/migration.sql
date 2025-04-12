/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
-- 1. 添加 key 列，但设置为可空
ALTER TABLE `Role` ADD COLUMN `key` VARCHAR(191) NULL;

-- 2. 更新现有的角色数据
UPDATE `Role` SET `key` = `name` WHERE `key` IS NULL;

-- 3. 将 key 列修改为非空
ALTER TABLE `Role` MODIFY COLUMN `key` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Role_key_key` ON `Role`(`key`);
