CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`action_type` text(50) NOT NULL,
	`detail` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`office_book_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`reserved_at` text NOT NULL,
	`fulfilled` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`office_book_id`) REFERENCES `book_copies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_loans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`office_book_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`borrowed_date` text NOT NULL,
	`returned_date` text,
	FOREIGN KEY (`office_book_id`) REFERENCES `book_copies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_loans`("id", "office_book_id", "user_id", "borrowed_date", "returned_date") SELECT "id", "office_book_id", "user_id", "borrowed_date", "returned_date" FROM `loans`;--> statement-breakpoint
DROP TABLE `loans`;--> statement-breakpoint
ALTER TABLE `__new_loans` RENAME TO `loans`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`content` text NOT NULL,
	`rating` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_reviews`("id", "book_id", "user_id", "content", "rating", "created_at") SELECT "id", "book_id", "user_id", "content", "rating", "created_at" FROM `reviews`;--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
ALTER TABLE `__new_reviews` RENAME TO `reviews`;