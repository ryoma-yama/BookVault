CREATE TABLE `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`google_id` text(100) NOT NULL,
	`isbn_13` text(13) NOT NULL,
	`title` text(255) NOT NULL,
	`publisher` text(255) NOT NULL,
	`published_date` text NOT NULL,
	`description` text NOT NULL
);
