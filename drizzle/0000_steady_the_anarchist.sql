CREATE TABLE `barang_tab` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uuid` varchar(36),
	`nama` varchar(255) NOT NULL,
	`harga` decimal(12,2) NOT NULL,
	`detail` text,
	CONSTRAINT `barang_tab_id` PRIMARY KEY(`id`)
);
