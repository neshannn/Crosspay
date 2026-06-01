CREATE TABLE `cart_items` (
	`id` varchar(36) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`serviceId` varchar(36) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` datetime NOT NULL,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL,
	`orderId` varchar(36) NOT NULL,
	`serviceId` varchar(36) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`priceAtTime` decimal(10,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `serviceId` varchar(36);--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `image` longtext;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `image` longtext;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_serviceId_services_id_fk` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_serviceId_services_id_fk` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE no action ON UPDATE no action;