CREATE TABLE `challenges` (
	`email` text PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`expires` integer NOT NULL,
	`sent` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer` text NOT NULL,
	`outlet` text NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`status` text NOT NULL,
	`pickup` text NOT NULL,
	`note` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`role` text NOT NULL,
	`outlet` text,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`outlet` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
