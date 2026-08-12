CREATE TABLE IF NOT EXISTS `submission_notification_events` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`event_key` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`last_error` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`sent_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `submission_notification_events_submission_event_idx` ON `submission_notification_events` (`submission_id`,`event_key`);
