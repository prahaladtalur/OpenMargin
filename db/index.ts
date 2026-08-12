import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}

export function getManuscriptBucket() {
  if (!env.MANUSCRIPTS) {
    throw new Error(
      "Cloudflare R2 binding `MANUSCRIPTS` is unavailable. Set the `r2` field in .openai/hosting.json to `MANUSCRIPTS` before using the submission portal."
    );
  }

  return env.MANUSCRIPTS;
}

const submissionTableSql = `
  CREATE TABLE IF NOT EXISTS submissions (
    id text PRIMARY KEY NOT NULL,
    author_name text NOT NULL,
    author_email text NOT NULL,
    age_band text NOT NULL,
    guardian_email text,
    school_or_organization text,
    country_or_region text,
    manuscript_title text NOT NULL,
    discipline text NOT NULL,
    abstract text NOT NULL,
    word_count integer NOT NULL,
    origin_note text NOT NULL,
    ai_disclosure text NOT NULL,
    manuscript_key text NOT NULL,
    manuscript_filename text NOT NULL,
    manuscript_content_type text NOT NULL,
    status text DEFAULT 'received' NOT NULL,
    original_work_confirmed integer NOT NULL,
    privacy_confirmed integer NOT NULL,
    guardian_confirmed integer DEFAULT false NOT NULL,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
  )
`;

const submissionNotificationEventsTableSql = `
  CREATE TABLE IF NOT EXISTS submission_notification_events (
    id text PRIMARY KEY NOT NULL,
    submission_id text NOT NULL,
    event_key text NOT NULL,
    status text DEFAULT 'pending' NOT NULL,
    last_error text,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    sent_at text
  )
`;

const submissionNotificationEventsIndexSql = `
  CREATE UNIQUE INDEX IF NOT EXISTS submission_notification_events_submission_event_idx
  ON submission_notification_events (submission_id, event_key)
`;

const reviewerApplicationsTableSql = `
  CREATE TABLE IF NOT EXISTS reviewer_applications (
    id text PRIMARY KEY NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    age_band text NOT NULL,
    guardian_email text,
    role text NOT NULL,
    disciplines text NOT NULL,
    experience text NOT NULL,
    availability text NOT NULL,
    statement text NOT NULL,
    ethics_confirmed integer NOT NULL,
    privacy_confirmed integer NOT NULL,
    status text DEFAULT 'received' NOT NULL,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
  )
`;

const partnerInquiriesTableSql = `
  CREATE TABLE IF NOT EXISTS partner_inquiries (
    id text PRIMARY KEY NOT NULL,
    organization_name text NOT NULL,
    contact_name text NOT NULL,
    contact_email text NOT NULL,
    contact_role text,
    organization_type text NOT NULL,
    focus text NOT NULL,
    cohort_size text,
    goals text NOT NULL,
    requested_path text NOT NULL,
    privacy_confirmed integer NOT NULL,
    status text DEFAULT 'received' NOT NULL,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
  )
`;

export async function ensureSubmissionTable() {
  if (!env.DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }
  await env.DB.batch([
    env.DB.prepare(submissionTableSql),
    env.DB.prepare(submissionNotificationEventsTableSql),
    env.DB.prepare(submissionNotificationEventsIndexSql),
    env.DB.prepare(reviewerApplicationsTableSql),
    env.DB.prepare(partnerInquiriesTableSql),
  ]);
}

export const ensureOperationsTables = ensureSubmissionTable;
