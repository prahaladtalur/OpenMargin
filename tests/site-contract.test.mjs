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
  const [statusRoute, notifications, schema, database, editorActions, statusLookup] = await Promise.all([
    source("app/api/editor/submissions/[id]/status/route.ts"),
    source("lib/notifications.ts"),
    source("db/schema.ts"),
    source("db/index.ts"),
    source("app/editor/EditorActions.tsx"),
    source("app/api/submission-status/route.ts"),
  ]);
  assert.match(statusRoute, /published/);
  assert.match(statusRoute, /submissionNotificationEvents/);
  assert.match(statusRoute, /onConflictDoNothing/);
  assert.match(statusRoute, /status: "sent"/);
  assert.match(statusRoute, /notifyAuthorOfDecision/);
  assert.match(statusRoute, /notifyEditorOfPublication/);
  assert.match(notifications, /notifyAuthorOfDecision/);
  assert.match(notifications, /notifyEditorOfPublication/);
  assert.match(schema, /submissionNotificationEvents/);
  assert.match(database, /submission_notification_events/);
  assert.match(editorActions, /published/);
  assert.match(statusLookup, /Published/);
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
