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

export async function ensureSubmissionTable() {
  if (!env.DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }
  await env.DB.prepare(submissionTableSql).run();
}
