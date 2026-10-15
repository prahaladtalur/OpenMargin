CREATE TABLE IF NOT EXISTS `publication_release_approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`public_version_hash` text NOT NULL,
	`author_age_status` text NOT NULL,
	`age_status_evidence` text NOT NULL,
	`author_approval_evidence` text NOT NULL,
	`guardian_approval_evidence` text,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `publication_release_approvals_submission_version_idx` ON `publication_release_approvals` (`submission_id`,`public_version_hash`);
