CREATE TABLE `audit_log_tab` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uuid` varchar(36),
	`user_uuid` varchar(36),
	`action` varchar(50) NOT NULL,
	`entity` varchar(50) NOT NULL,
	`entity_uuid` varchar(36),
	`old_data` json,
	`new_data` json,
	`ip_address` varchar(45),
	`user_agent` varchar(512),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `audit_log_tab_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `barang_tab` ADD `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `barang_tab` ADD `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `barang_tab` ADD `created_by` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `barang_tab` ADD `updated_by` varchar(36) DEFAULT 'Empty';--> statement-breakpoint
ALTER TABLE `barang_tab` ADD `enabled` boolean DEFAULT true;