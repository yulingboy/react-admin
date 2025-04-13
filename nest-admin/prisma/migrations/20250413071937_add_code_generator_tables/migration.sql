-- CreateTable
CREATE TABLE `CodeGenerator` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `tableName` VARCHAR(191) NOT NULL,
    `moduleName` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(191) NOT NULL,
    `packageName` VARCHAR(191) NOT NULL,
    `functionName` VARCHAR(191) NOT NULL,
    `functionAuthor` VARCHAR(191) NOT NULL,
    `tablePrefix` VARCHAR(191) NULL,
    `options` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CodeGeneratorColumn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `generatorId` INTEGER NOT NULL,
    `columnName` VARCHAR(191) NOT NULL,
    `columnComment` VARCHAR(191) NULL,
    `columnType` VARCHAR(191) NOT NULL,
    `tsType` VARCHAR(191) NOT NULL,
    `isPk` BOOLEAN NOT NULL DEFAULT false,
    `isIncrement` BOOLEAN NOT NULL DEFAULT false,
    `isRequired` BOOLEAN NOT NULL DEFAULT true,
    `isInsert` BOOLEAN NOT NULL DEFAULT true,
    `isEdit` BOOLEAN NOT NULL DEFAULT true,
    `isList` BOOLEAN NOT NULL DEFAULT true,
    `isQuery` BOOLEAN NOT NULL DEFAULT false,
    `queryType` VARCHAR(191) NULL,
    `htmlType` VARCHAR(191) NULL,
    `dictType` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,

    INDEX `CodeGeneratorColumn_generatorId_idx`(`generatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CodeGeneratorColumn` ADD CONSTRAINT `CodeGeneratorColumn_generatorId_fkey` FOREIGN KEY (`generatorId`) REFERENCES `CodeGenerator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
