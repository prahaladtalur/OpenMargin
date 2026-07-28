import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  ageBand: text("age_band").notNull(),
  guardianEmail: text("guardian_email"),
  schoolOrOrganization: text("school_or_organization"),
  countryOrRegion: text("country_or_region"),
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
  originalWorkConfirmed: integer("original_work_confirmed", { mode: "boolean" }).notNull(),
  privacyConfirmed: integer("privacy_confirmed", { mode: "boolean" }).notNull(),
  guardianConfirmed: integer("guardian_confirmed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

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
