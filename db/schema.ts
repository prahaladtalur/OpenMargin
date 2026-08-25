import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  ageBand: text("age_band").notNull(),
  guardianEmail: text("guardian_email"),
  schoolOrOrganization: text("school_or_organization"),
  countryOrRegion: text("country_or_region"),
  campaignSource: text("campaign_source"),
  campaignMedium: text("campaign_medium"),
  campaignName: text("campaign_name"),
  landingPath: text("landing_path"),
  manuscriptTitle: text("manuscript_title").notNull(),
  discipline: text("discipline").notNull(),
  abstract: text("abstract").notNull(),
  wordCount: integer("word_count").notNull(),
  originNote: text("origin_note").notNull(),
  aiDisclosure: text("ai_disclosure").notNull(),
  manuscriptKey: text("manuscript_key").notNull(),
  manuscriptFilename: text("manuscript_filename").notNull(),
  manuscriptContentType: text("manuscript_content_type").notNull(),
  status: text("status").notNull().default("received"),
  editorMessage: text("editor_message"),
  originalWorkConfirmed: integer("original_work_confirmed", { mode: "boolean" }).notNull(),
  privacyConfirmed: integer("privacy_confirmed", { mode: "boolean" }).notNull(),
  guardianConfirmed: integer("guardian_confirmed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reviewAssignments = sqliteTable("review_assignments", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull(),
  reviewerName: text("reviewer_name").notNull(),
  reviewerEmail: text("reviewer_email").notNull(),
  reviewerApplicationId: text("reviewer_application_id"),
  status: text("status").notNull().default("invited"),
  dueAt: text("due_at"),
  conflictConfirmed: integer("conflict_confirmed", { mode: "boolean" }).notNull().default(false),
  confidentialityConfirmed: integer("confidentiality_confirmed", { mode: "boolean" }).notNull().default(false),
  questionScore: integer("question_score"),
  contextScore: integer("context_score"),
  methodScore: integer("method_score"),
  evidenceScore: integer("evidence_score"),
  clarityScore: integer("clarity_score"),
  integrityScore: integer("integrity_score"),
  recommendation: text("recommendation"),
  comments: text("comments"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  submittedAt: text("submitted_at"),
});

export const submissionNotificationEvents = sqliteTable("submission_notification_events", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull(),
  eventKey: text("event_key").notNull(),
  status: text("status").notNull().default("pending"),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  sentAt: text("sent_at"),
}, (table) => ({
  submissionEventUnique: uniqueIndex("submission_notification_events_submission_event_idx").on(table.submissionId, table.eventKey),
}));

export const publishedArticles = sqliteTable("published_articles", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  authorName: text("author_name").notNull(),
  discipline: text("discipline").notNull(),
  abstract: text("abstract").notNull(),
  body: text("body").notNull(),
  issue: text("issue").notNull().default("Volume 01"),
  publishedAt: text("published_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  articleSubmissionUnique: uniqueIndex("published_articles_submission_idx").on(table.submissionId),
  articleSlugUnique: uniqueIndex("published_articles_slug_idx").on(table.slug),
}));

export const reviewerApplications = sqliteTable("reviewer_applications", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  ageBand: text("age_band").notNull(),
  guardianEmail: text("guardian_email"),
  role: text("role").notNull(),
  disciplines: text("disciplines").notNull(),
  experience: text("experience").notNull(),
  availability: text("availability").notNull(),
  statement: text("statement").notNull(),
  ethicsConfirmed: integer("ethics_confirmed", { mode: "boolean" }).notNull(),
  privacyConfirmed: integer("privacy_confirmed", { mode: "boolean" }).notNull(),
  status: text("status").notNull().default("received"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const partnerInquiries = sqliteTable("partner_inquiries", {
  id: text("id").primaryKey(),
  organizationName: text("organization_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactRole: text("contact_role"),
  organizationType: text("organization_type").notNull(),
  focus: text("focus").notNull(),
  cohortSize: text("cohort_size"),
  goals: text("goals").notNull(),
  requestedPath: text("requested_path").notNull(),
  privacyConfirmed: integer("privacy_confirmed", { mode: "boolean" }).notNull(),
  status: text("status").notNull().default("received"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
