PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_authors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(100) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_authors`("id", "name") SELECT "id", "name" FROM `authors`;--> statement-breakpoint
DROP TABLE `authors`;--> statement-breakpoint
ALTER TABLE `__new_authors` RENAME TO `authors`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`google_id` text(100),
	`isbn_13` text(13) NOT NULL,
	`title` text(100) NOT NULL,
	`publisher` text(100) NOT NULL,
	`published_date` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_books`("id", "google_id", "isbn_13", "title", "publisher", "published_date", "description") SELECT "id", "google_id", "isbn_13", "title", "publisher", "published_date", "description" FROM `books`;--> statement-breakpoint
DROP TABLE `books`;--> statement-breakpoint
ALTER TABLE `__new_books` RENAME TO `books`;--> statement-breakpoint
CREATE UNIQUE INDEX `books_google_id_unique` ON `books` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `books_isbn_13_unique` ON `books` (`isbn_13`);--> statement-breakpoint
CREATE TABLE `__new_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(50) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tags`("id", "name") SELECT "id", "name" FROM `tags`;--> statement-breakpoint
DROP TABLE `tags`;--> statement-breakpoint
ALTER TABLE `__new_tags` RENAME TO `tags`;