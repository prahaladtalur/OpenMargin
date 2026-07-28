CREATE TABLE `partner_inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_name` text NOT NULL,
	`contact_name` text NOT NULL,
	`contact_email` text NOT NULL,
	`contact_role` text,
	`organization_type` text NOT NULL,
	`focus` text NOT NULL,
	`cohort_size` text,
	`goals` text NOT NULL,
	`requested_path` text NOT NULL,
	`privacy_confirmed` integer NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviewer_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`age_band` text NOT NULL,
	`guardian_email` text,
	`role` text NOT NULL,
	`disciplines` text NOT NULL,
	`experience` text NOT NULL,
	`availability` text NOT NULL,
	`statement` text NOT NULL,
	`ethics_confirmed` integer NOT NULL,
	`privacy_confirmed` integer NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
