-- CreateTable
CREATE TABLE `Account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `status` TINYINT NULL DEFAULT 1,
    `remark` VARCHAR(191) NULL,
    `contact` VARCHAR(191) NULL,
    `merchantName` VARCHAR(191) NULL,
    `isAdmin` TINYINT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Account_phone_key`(`phone`),
    INDEX `Account_phone_merchantName_idx`(`phone`, `merchantName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
