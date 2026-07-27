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
