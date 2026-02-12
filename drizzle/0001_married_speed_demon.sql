CREATE TABLE `role_tab` (
	`uuid` varchar(36) NOT NULL,
	`nama` varchar(255) NOT NULL,
	CONSTRAINT `role_tab_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `token_tab` (
	`user_uuid` varchar(36) NOT NULL,
	`refresh_token` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `token_tab_user_uuid_unique` UNIQUE(`user_uuid`)
);
--> statement-breakpoint
CREATE TABLE `user_role_tab` (
	`uuid` varchar(36) NOT NULL,
	`user_uuid` varchar(36),
	`role_uuid` varchar(36),
	CONSTRAINT `user_role_tab_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `user_tab` (
	`uuid` varchar(36) NOT NULL,
	`nama` varchar(255) NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	CONSTRAINT `user_tab_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
ALTER TABLE `token_tab` ADD CONSTRAINT `token_tab_user_uuid_user_tab_uuid_fk` FOREIGN KEY (`user_uuid`) REFERENCES `user_tab`(`uuid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_role_tab` ADD CONSTRAINT `user_role_tab_user_uuid_user_tab_uuid_fk` FOREIGN KEY (`user_uuid`) REFERENCES `user_tab`(`uuid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_role_tab` ADD CONSTRAINT `user_role_tab_role_uuid_role_tab_uuid_fk` FOREIGN KEY (`role_uuid`) REFERENCES `role_tab`(`uuid`) ON DELETE no action ON UPDATE no action;