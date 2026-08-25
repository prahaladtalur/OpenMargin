import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("keeps the public journal routes and policy content in source", async () => {
  const [home, policies, submit] = await Promise.all([
    source("app/page.tsx"),
    source("app/policies/page.tsx"),
    source("app/submit/page.tsx"),
  ]);
  assert.match(home, /Student research,/);
  assert.match(policies, /How we handle submissions\./);
  assert.match(policies, /Privacy, minors and guardian contact/);
  assert.match(submit, /SubmissionForm/);
});

test("keeps submission data private and durable", async () => {
  const [route, schema, hosting] = await Promise.all([
    source("app/api/submissions/route.ts"),
    source("db/schema.ts"),
    source(".openai/hosting.json"),
  ]);
  assert.match(route, /getManuscriptBucket/);
  assert.match(route, /MAX_FILE_BYTES/);
  assert.match(schema, /submissions/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(hosting, /"r2": "MANUSCRIPTS"/);
});

test("keeps author submissions open to every age", async () => {
  const [form, submitPage, route] = await Promise.all([
    source("app/submit/SubmissionForm.tsx"),
    source("app/submit/page.tsx"),
    source("app/api/submissions/route.ts"),
  ]);
  assert.doesNotMatch(form, /Age band/);
  assert.match(submitPage, /Anyone can submit/);
  assert.doesNotMatch(route, /limited to authors ages/);
  assert.match(route, /ageBand: "not-collected"/);
});

test("keeps editorial review surfaces private", async () => {
  const [editorPage, editorAuth, statusRoute] = await Promise.all([
    source("app/editor/page.tsx"),
    source("lib/editor-auth.ts"),
    source("app/api/editor/submissions/[id]/status/route.ts"),
  ]);
  assert.match(editorPage, /requireEditor/);
  assert.match(editorAuth, /EDITOR_PASSWORD/);
  assert.match(editorAuth, /EDITOR_SESSION_SECRET/);
  assert.match(statusRoute, /getEditorForApi/);
});

test("sends durable decision and publication notifications", async () => {
  const [statusRoute, notifications, notificationWorkflow, schema, database, editorActions, statusLookup, migration] = await Promise.all([
    source("app/api/editor/submissions/[id]/status/route.ts"),
    source("lib/notifications.ts"),
    source("lib/submission-notifications.ts"),
    source("db/schema.ts"),
    source("db/index.ts"),
    source("app/editor/EditorActions.tsx"),
    source("app/api/submission-status/route.ts"),
    source("drizzle/0004_editor_messages.sql"),
  ]);
  assert.match(statusRoute, /published/);
  assert.match(statusRoute, /sendStatusNotifications/);
  assert.match(notifications, /notifyAuthorOfDecision/);
  assert.match(notifications, /notifyEditorOfPublication/);
  assert.match(notificationWorkflow, /submissionNotificationEvents/);
  assert.match(notificationWorkflow, /onConflictDoNothing/);
  assert.match(notificationWorkflow, /status: "sent"/);
  assert.match(schema, /submissionNotificationEvents/);
  assert.match(database, /submission_notification_events/);
  assert.match(statusRoute, /editorMessage/);
  assert.match(notifications, /Editor's message/);
  assert.match(schema, /editorMessage/);
  assert.match(database, /editor_message/);
  assert.match(editorActions, /Decision letter note/);
  assert.match(migration, /ADD `editor_message` text/);
  assert.match(editorActions, /published/);
  assert.match(statusLookup, /Published/);
});

test("publishes only approved accepted work to a public article route", async () => {
  const [publishRoute, editorForm, articlePage, issuePage, schema, database, migration] = await Promise.all([
    source("app/api/editor/submissions/[id]/publish/route.ts"),
    source("app/editor/PublishArticleForm.tsx"),
    source("app/articles/[slug]/page.tsx"),
    source("app/issue/page.tsx"),
    source("db/schema.ts"),
    source("db/index.ts"),
    source("drizzle/0003_worried_luckman.sql"),
  ]);
  assert.match(publishRoute, /authorApprovalConfirmed/);
  assert.match(publishRoute, /Only an accepted submission can be published/);
  assert.match(publishRoute, /publishedArticles/);
  assert.match(publishRoute, /sendStatusNotifications/);
  assert.match(editorForm, /Publish article/);
  assert.match(editorForm, /author-approved/);
  assert.match(articlePage, /notFound/);
  assert.match(articlePage, /publishedArticles/);
  assert.match(issuePage, /publishedArticles/);
  assert.match(issuePage, /articles\//);
  assert.match(schema, /publishedArticles/);
  assert.match(database, /published_articles/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS/);
  assert.doesNotMatch(articlePage, /—/);
});

test("keeps contributor and partnership intake durable and editor-only", async () => {
  const [reviewerRoute, partnerRoute, recruitmentPage, reviewerStatus, partnerStatus] = await Promise.all([
    source("app/api/reviewer-applications/route.ts"),
    source("app/api/partner-inquiries/route.ts"),
    source("app/editor/recruitment/page.tsx"),
    source("app/api/editor/reviewer-applications/[id]/status/route.ts"),
    source("app/api/editor/partner-inquiries/[id]/status/route.ts"),
  ]);
  assert.match(reviewerRoute, /ensureOperationsTables/);
  assert.match(reviewerRoute, /notifyEditorOfReviewerApplication/);
  assert.match(partnerRoute, /ensureOperationsTables/);
  assert.match(partnerRoute, /notifyEditorOfPartnerInquiry/);
  assert.match(recruitmentPage, /requireEditor/);
  assert.match(reviewerStatus, /getEditorForApi/);
  assert.match(partnerStatus, /getEditorForApi/);
});

test("keeps author status lookup private and public journal copy free of em dashes", async () => {
  const [statusRoute, statusPage, home, issue, share] = await Promise.all([
    source("app/api/submission-status/route.ts"),
    source("app/status/page.tsx"),
    source("app/page.tsx"),
    source("app/issue/page.tsx"),
    source("app/share/page.tsx"),
  ]);
  assert.match(statusRoute, /submissions\.authorEmail/);
  assert.match(statusRoute, /submissions\.id/);
  assert.match(statusPage, /SubmissionStatusForm/);
  assert.match(share, /Copy and send/);
  assert.match(share, /Students submit directly/);
  assert.doesNotMatch(home, /—/);
  assert.doesNotMatch(issue, /—/);
  assert.doesNotMatch(share, /—/);
});

test("keeps public publication evidence and discovery metadata connected", async () => {
  const [home, transparency, article, sitemap, robots, launchKit, readiness] = await Promise.all([
    source("app/page.tsx"),
    source("app/transparency/page.tsx"),
    source("app/articles/[slug]/page.tsx"),
    source("app/sitemap.ts"),
    source("app/robots.ts"),
    source("docs/pilot-launch-kit.md"),
    source("docs/scopus-readiness.md"),
  ]);
  assert.match(home, /getPublishedArticles/);
  assert.match(home, /published work/);
  assert.match(transparency, /Published articles/);
  assert.match(transparency, /Authors retain copyright/);
  assert.match(article, /ScholarlyArticle/);
  assert.match(article, /Suggested citation/);
  assert.match(article, /canonical/);
  assert.match(sitemap, /openmargin\.org/);
  assert.match(sitemap, /articles\//);
  assert.match(robots, /sitemap\.xml/);
  assert.match(launchKit, /https:\/\/openmargin\.org\/submit/);
  assert.match(readiness, /not in Scopus/);
  assert.doesNotMatch(transparency, /—/);
});

test("keeps review assignments and reports private and durable", async () => {
  const [schema, database, migration, createRoute, updateRoute, editorPage, reviewForm] = await Promise.all([
    source("db/schema.ts"),
    source("db/index.ts"),
    source("drizzle/0005_review_assignments.sql"),
    source("app/api/editor/submissions/[id]/reviews/route.ts"),
    source("app/api/editor/reviews/[id]/route.ts"),
    source("app/editor/page.tsx"),
    source("app/editor/ReviewAssignments.tsx"),
  ]);
  assert.match(schema, /reviewAssignments/);
  assert.match(database, /review_assignments/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS `review_assignments`/);
  assert.match(createRoute, /getEditorForApi/);
  assert.match(createRoute, /reviewerEmail/);
  assert.match(updateRoute, /conflictConfirmed/);
  assert.match(updateRoute, /six scores/);
  assert.match(editorPage, /reviewsBySubmission/);
  assert.match(editorPage, /Reviews submitted/);
  assert.match(reviewForm, /Review records/);
  assert.match(reviewForm, /Save review record/);
});

test("keeps operating documentation aligned with the live product", async () => {
  const [readme, releaseChecklist, monthOne, sprint, copyPack] = await Promise.all([
    source("README.md"),
    source("docs/release-checklist.md"),
    source("docs/month-one-delivery.md"),
    source("docs/marketing-sprint.md"),
    source("docs/marketing-copy-pack.md"),
  ]);
  assert.doesNotMatch(readme, /placeholder brand/);
  assert.match(readme, /Private editor desk/);
  assert.match(readme, /Publish four more articles/);
  assert.match(releaseChecklist, /EDITOR_SESSION_SECRET/);
  assert.match(releaseChecklist, /No private manuscript/);
  assert.match(monthOne, /private review log/);
  assert.match(sprint, /30-day calendar/);
  assert.match(sprint, /Do not collect IP addresses/);
  assert.match(copyPack, /I am the person who built it/);
});

test("keeps marketing attribution private and useful", async () => {
  const [schema, database, migration, route, form, editorPage, marketingPage, guide, layout] = await Promise.all([
    source("db/schema.ts"),
    source("db/index.ts"),
    source("drizzle/0006_campaign_attribution.sql"),
    source("app/api/submissions/route.ts"),
    source("app/submit/SubmissionForm.tsx"),
    source("app/editor/page.tsx"),
    source("app/editor/marketing/page.tsx"),
    source("app/guide/page.tsx"),
    source("app/layout.tsx"),
  ]);
  assert.match(schema, /campaignSource/);
  assert.match(database, /campaign_source text/);
  assert.match(migration, /ADD `campaign_name` text/);
  assert.match(route, /landingPath/);
  assert.match(form, /utm_source/);
  assert.match(editorPage, /Marketing desk/);
  assert.match(marketingPage, /requireEditor/);
  assert.match(marketingPage, /does not collect IP addresses/);
  assert.match(guide, /FAQPage/);
  assert.match(guide, /Who can submit/);
  assert.match(layout, /https:\/\/openmargin\.org/);
  assert.doesNotMatch(layout, /x-forwarded-host/);
});
