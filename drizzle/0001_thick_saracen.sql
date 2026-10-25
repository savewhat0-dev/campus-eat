CREATE TABLE `profiles` (
	`email` text PRIMARY KEY NOT NULL,
	`details` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_details` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `decision_note` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `request_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_id_unique` ON `orders` (`request_id`);