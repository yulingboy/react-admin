-- CreateTable
CREATE TABLE `Dictionary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `isSystem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Dictionary_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DictionaryItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dictionaryId` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `extra` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `DictionaryItem_dictionaryId_idx`(`dictionaryId`),
    UNIQUE INDEX `DictionaryItem_dictionaryId_code_key`(`dictionaryId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DictionaryItem` ADD CONSTRAINT `DictionaryItem_dictionaryId_fkey` FOREIGN KEY (`dictionaryId`) REFERENCES `Dictionary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
