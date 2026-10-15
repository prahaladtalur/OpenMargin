CREATE TABLE `submission_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`version_number` integer NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`object_key` text NOT NULL,
	`editor_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submission_revisions_submission_version_idx` ON `submission_revisions` (`submission_id`,`version_number`);
--> statement-breakpoint
CREATE INDEX `submission_revisions_submission_idx` ON `submission_revisions` (`submission_id`,`created_at`);
