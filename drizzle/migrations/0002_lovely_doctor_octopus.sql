CREATE TABLE `loans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`office_book_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`borrowed_date` text NOT NULL,
	`returned_date` text,
	FOREIGN KEY (`office_book_id`) REFERENCES `book_copies`(`id`) ON UPDATE no action ON DELETE no action
);
