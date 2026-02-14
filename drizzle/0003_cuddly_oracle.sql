ALTER TABLE `barang_tab` ADD `idempotency_key` varchar(36);--> statement-breakpoint
ALTER TABLE `barang_tab` ADD CONSTRAINT `barang_tab_idempotency_key_unique` UNIQUE(`idempotency_key`);