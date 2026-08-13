CREATE TABLE IF NOT EXISTS `published_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`author_name` text NOT NULL,
	`discipline` text NOT NULL,
	`abstract` text NOT NULL,
	`body` text NOT NULL,
	`issue` text DEFAULT 'Volume 01' NOT NULL,
	`published_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `published_articles_submission_idx` ON `published_articles` (`submission_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `published_articles_slug_idx` ON `published_articles` (`slug`);
