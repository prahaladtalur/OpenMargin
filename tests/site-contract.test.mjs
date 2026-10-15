import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import {
  isRevisionVersionConflict,
  MAX_REVISION_REQUEST_BYTES,
  readBoundedRevisionForm,
  RevisionIntakeError,
  validateRevisionFile,
} from "../lib/private-revisions.mjs";
import { hasEvidenceNote, hashPublicVersion, isKnownMinorSubmission } from "../lib/publication-approval.mjs";
import { isReviewerEligibleForManuscriptAccess } from "../lib/reviewer-eligibility.mjs";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

async function loadRouteForNotificationTest(rows, pendingEvents, delivery, updates = []) {
  const route = await source("app/api/editor/submissions/[id]/status/route.ts");
  const exports = {};
  let selectCount = 0;
  const db = {
    select() {
      const result = selectCount++ === 0 ? rows : pendingEvents;
      return { from() { return { where() { return { limit: async () => result }; } }; } };
    },
    update() { return { set(value) { updates.push(value); return { where: async () => {} }; } }; },
  };
  const modules = {
    "drizzle-orm": { eq: () => {}, and: () => {}, inArray: () => {} },
    "../../../../../../lib/editor-auth": { getEditorForApi: async () => true },
    "../../../../../../db": { ensureSubmissionTable: async () => {}, getDb: () => db },
    "../../../../../../db/schema": { submissions: {}, publishedArticles: {}, submissionNotificationEvents: {} },
    "../../../../../../lib/submission-notifications": { sendStatusNotifications: delivery },
    "../../../../../../lib/review-policy": await loadReviewPolicy(),
  };
  const compiled = ts.transpileModule(route, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "exports", compiled)((name) => {
    assert.ok(modules[name], `Unexpected route dependency: ${name}`);
    return modules[name];
  }, exports);
  return exports.PATCH;
}

async function loadReviewPolicy() {
  const exports = {};
  const compiled = ts.transpileModule(await source("lib/review-policy.ts"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("exports", compiled)(exports);
  return exports;
}

async function loadSubmissionNotificationsForTest(events, providerResponses) {
  const [notificationsSource, statusSource] = await Promise.all([
    source("lib/notifications.ts"),
    source("lib/submission-notifications.ts"),
  ]);
  const notificationExports = {};
  const notificationCompiled = ts.transpileModule(notificationsSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const requests = [];
  const oldFetch = globalThis.fetch;
  const oldConsoleError = console.error;
  globalThis.fetch = async (_url, init) => {
    requests.push(JSON.parse(init.body));
    const result = providerResponses.shift() ?? { ok: true, status: 200 };
    return { ok: result.ok, status: result.status, text: async () => result.message ?? "" };
  };
  console.error = () => {};
  new Function("require", "exports", notificationCompiled)((name) => {
    assert.equal(name, "cloudflare:workers");
    return { env: { RESEND_API_KEY: "test-key", RESEND_FROM: "Open Margin <journal@example.invalid>", NOTIFICATION_EMAIL: "editor@example.invalid" } };
  }, notificationExports);

  const submissionNotificationEvents = { id: "id", submissionId: "submissionId", eventKey: "eventKey" };
  const db = {
    insert() {
      return { values(value) { return { onConflictDoNothing: async () => { events.set(value.eventKey, events.get(value.eventKey) ?? value); } }; } };
    },
    select() {
      let conditions = [];
      return {
        from() { return this; },
        where(value) { conditions = value; return this; },
        limit: async () => {
          const eventKey = conditions.find((condition) => condition.column === "eventKey")?.value;
          const event = events.get(eventKey);
          return event ? [event] : [];
        },
      };
    },
    update() {
      return { set(value) { return { where: async (conditions) => {
        const list = Array.isArray(conditions) ? conditions : [conditions];
        const id = list.find((condition) => condition.column === "id")?.value;
        const event = [...events.values()].find((candidate) => candidate.id === id);
        if (event) Object.assign(event, value);
      } }; } };
    },
  };
  const statusExports = {};
  const statusCompiled = ts.transpileModule(statusSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "exports", statusCompiled)((name) => {
    const modules = {
      "drizzle-orm": { and: (...conditions) => conditions, eq: (column, value) => ({ column, value }) },
      "../db": { getDb: () => db },
      "../db/schema": { submissionNotificationEvents, submissions: {} },
      "./notifications": notificationExports,
    };
    assert.ok(modules[name], `Unexpected notification dependency: ${name}`);
    return modules[name];
  }, statusExports);

  return {
    db,
    requests,
    sendStatusNotifications: statusExports.sendStatusNotifications,
    restore() { globalThis.fetch = oldFetch; console.error = oldConsoleError; },
  };
}

async function loadRevisionRoutes({ authorized = true, selectRows = [], bucket, inserted = [] } = {}) {
  const [intake, download] = await Promise.all([
    source("app/api/editor/submissions/[id]/revisions/route.ts"),
    source("app/api/editor/submissions/[id]/revisions/[revisionId]/route.ts"),
  ]);
  const routeExports = [{}, {}];
  let selectCount = 0;
  const db = {
    select() {
      const rows = selectRows[selectCount++] ?? [];
      const query = {
        from() { return query; },
        where() { return query; },
        limit: async () => rows,
        orderBy: async () => rows,
        then(resolve, reject) { return Promise.resolve(rows).then(resolve, reject); },
      };
      return query;
    },
    insert() { return { values: async (value) => { inserted.push(value); } }; },
  };
  const modules = {
    "drizzle-orm": { and: () => ({}), desc: () => ({}), eq: () => ({}), max: () => ({}) },
    "../../../../../../lib/editor-auth": { getEditorForApi: async () => authorized },
    "../../../../../../../lib/editor-auth": { getEditorForApi: async () => authorized },
    "../../../../../../db": { ensureSubmissionTable: async () => {}, getDb: () => db, getManuscriptBucket: () => bucket },
    "../../../../../../../db": { ensureSubmissionTable: async () => {}, getDb: () => db, getManuscriptBucket: () => bucket },
    "../../../../../../db/schema": { submissionRevisions: {}, submissions: { id: "id" } },
    "../../../../../../../db/schema": { submissionRevisions: { id: "id", submissionId: "submissionId" }, submissions: { id: "id" } },
    "../../../../../../lib/private-revisions.mjs": await import("../lib/private-revisions.mjs"),
  };
  for (const [index, route] of [intake, download].entries()) {
    const compiled = ts.transpileModule(route, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    new Function("require", "exports", compiled)((name) => {
      assert.ok(modules[name], `Unexpected revision route dependency: ${name}`);
      return modules[name];
    }, routeExports[index]);
  }
  return { ...routeExports[0], download: routeExports[1].GET, db };
}

const author = { authorName: "Test Author", authorEmail: "author@example.invalid" };
const completeReview = {
  status: "submitted", manuscriptVersionId: "original", reviewerName: "Independent Reviewer", reviewerEmail: "reviewer@example.invalid", reviewerApplicationId: "RV-1",
  conflictConfirmed: true, confidentialityConfirmed: true,
  questionScore: 3, contextScore: 3, methodScore: 3, evidenceScore: 3, clarityScore: 3, integrityScore: 3,
  recommendation: "revise", comments: "Test-only written feedback with specific questions about the method, evidence and limits of this manuscript.",
};

test("keeps private manuscript revision routes editor-only", async () => {
  const routes = await loadRevisionRoutes({ authorized: false });
  const params = Promise.resolve({ id: "submission-1", revisionId: "revision-1" });
  const upload = await routes.POST(new Request("https://test.invalid", { method: "POST" }), { params });
  const list = await routes.GET(new Request("https://test.invalid"), { params });
  const download = await routes.download(new Request("https://test.invalid"), { params });
  assert.equal(upload.status, 401);
  assert.equal(list.status, 401);
  assert.equal(download.status, 401);
});

test("stores an author-provided revision privately without changing editorial status or sending mail", async () => {
  const inserted = [];
  const writes = [];
  const bucket = {
    async put(key, body, options) { writes.push({ key, body, options }); },
    async delete() { assert.fail("Successful uploads must not be deleted"); },
  };
  const routes = await loadRevisionRoutes({
    selectRows: [[{ id: "submission-1" }], [{ latestVersion: 1 }]],
    bucket,
    inserted,
  });
  const form = new FormData();
  form.set("revisionFile", new File(["%PDF-1.7\nrevised manuscript"], "revised.pdf", { type: "application/pdf" }));
  form.set("editorNote", "Author revision received Oct 12");
  form.set("authorProvidedConfirmed", "on");
  const response = await routes.POST(new Request("https://test.invalid", { method: "POST", body: form }), { params: Promise.resolve({ id: "submission-1" }) });
  assert.equal(response.status, 201);
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].submissionId, "submission-1");
  assert.equal(inserted[0].versionNumber, 2);
  assert.equal(inserted[0].editorNote, "Author revision received Oct 12");
  assert.match(inserted[0].objectKey, /^submissions\/submission-1\/revisions\//);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].options.httpMetadata.contentType, "application/pdf");
  assert.equal(writes[0].options.customMetadata.versionNumber, "2");
  assert.deepEqual(Object.keys(routes).filter((key) => key === "PATCH" || key === "PUT"), []);
});

test("rejects invalid and oversized private revision uploads before storage", async () => {
  const writes = [];
  const bucket = { async put(...args) { writes.push(args); } };
  const routes = await loadRevisionRoutes({ bucket });
  const send = async (file) => {
    const form = new FormData();
    form.set("revisionFile", file);
    form.set("editorNote", "");
    form.set("authorProvidedConfirmed", "on");
    return routes.POST(new Request("https://test.invalid", { method: "POST", body: form }), { params: Promise.resolve({ id: "submission-1" }) });
  };
  assert.equal((await send(new File(["not a PDF"], "paper.pdf", { type: "application/pdf" }))).status, 400);
  const oversized = new Request("https://test.invalid/revision", { method: "POST", body: new Uint8Array(MAX_REVISION_REQUEST_BYTES + 1) });
  await assert.rejects(readBoundedRevisionForm(oversized), (error) => error instanceof RevisionIntakeError && error.status === 413);
  assert.equal(writes.length, 0);
});

test("returns private revision downloads without cache or MIME sniffing", async () => {
  const bucket = { async get() { return { body: new Blob(["%PDF-1.7"]).stream() }; } };
  const routes = await loadRevisionRoutes({
    selectRows: [
      [{ id: "revision-1", submissionId: "submission-1", objectKey: "private/revision.pdf", fileName: "revision.pdf", contentType: "application/pdf" }],
      [{ id: "submission-1" }],
    ],
    bucket,
  });
  const response = await routes.download(new Request("https://test.invalid"), { params: Promise.resolve({ id: "submission-1", revisionId: "revision-1" }) });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("Content-Disposition"), 'attachment; filename="revision.pdf"');
});

test("recognizes SQLite revision-version conflicts without masking other database errors", () => {
  assert.equal(isRevisionVersionConflict(new Error("UNIQUE constraint failed: submission_revisions.submission_id, submission_revisions.version_number")), true);
  assert.equal(isRevisionVersionConflict(new Error("submission_revisions_submission_version_idx")), true);
  assert.equal(isRevisionVersionConflict(new Error("UNIQUE constraint failed: submission_revisions.id")), false);
  assert.equal(isRevisionVersionConflict(new Error("storage unavailable")), false);
});

test("sets the multipart server-action parser above the private revision limit", async () => {
  const config = await source("next.config.mjs");
  assert.match(config, /bodySizeLimit:\s*["']11mb["']/);
});

test("shows append-only private manuscript versions in the editor", async () => {
  const [schema, database, migration, editor, component, download] = await Promise.all([
    source("db/schema.ts"),
    source("db/index.ts"),
    source("drizzle/0007_private_submission_revisions.sql"),
    source("app/editor/page.tsx"),
    source("app/editor/ManuscriptVersions.tsx"),
    source("app/api/editor/submissions/[id]/revisions/[revisionId]/route.ts"),
  ]);
  assert.match(schema, /submissionRevisions = sqliteTable\("submission_revisions"/);
  assert.match(schema, /submission_revisions_submission_idx/);
  assert.match(database, /CREATE TABLE IF NOT EXISTS submission_revisions/);
  assert.match(database, /submission_revisions_submission_version_idx/);
  assert.match(migration, /submission_revisions/);
  assert.match(editor, /<ManuscriptVersions/);
  assert.match(component, /Save private revision/);
  assert.match(component, /does not change its status, publish it, or send a message/);
  assert.match(download, /getEditorForApi/);
  assert.match(download, /Cache-Control": "private, no-store"/);
  assert.match(download, /X-Content-Type-Options/);
});

test("publication notice to the editor does not say the author email succeeded when it failed", async () => {
  const events = new Map([
    ["author:published", { id: "author-event", eventKey: "author:published", status: "pending" }],
    ["editor:published", { id: "editor-event", eventKey: "editor:published", status: "pending" }],
  ]);
  const notifications = await loadSubmissionNotificationsForTest(events, [
    { ok: false, status: 422, message: "Test-only rejection" },
    { ok: true, status: 200 },
  ]);
  try {
    const pending = await notifications.sendStatusNotifications(notifications.db, {
      id: "submission-test",
      authorName: "Test Author",
      authorEmail: "author@example.invalid",
      manuscriptTitle: "Test Paper",
      discipline: "Humanities",
      guardianConfirmed: false,
    }, "published", "/articles/test-paper");
    assert.deepEqual(pending, ["Email provider rejected the request."]);
    assert.equal(notifications.requests.length, 2);
    assert.match(notifications.requests[1].text, /email provider did not accept the author's publication notice/i);
    assert.doesNotMatch(notifications.requests[1].text, /author publication notice was also sent/i);
  } finally {
    notifications.restore();
  }
});

test("notes-only saves never change status or retry failed publication mail", async () => {
  for (const status of ["published", "accepted", "screening"]) {
    const updates = [];
    let deliveries = 0;
    const patch = await loadRouteForNotificationTest(
      [{ id: "test-only", status, editorMessage: "Old note" }],
      [{ eventKey: "author:published", status: "failed" }],
      async () => { deliveries++; return []; }, updates,
    );
    const response = await patch(new Request("https://test.invalid", { method: "PATCH", body: JSON.stringify({ noteOnly: true, status: "accepted", editorMessage: "  Current audit note  " }) }), { params: Promise.resolve({ id: "test-only" }) });
    assert.equal(response.status, 200);
    assert.deepEqual(updates, [{ editorMessage: "Current audit note" }]);
    assert.equal(deliveries, 0);
    assert.deepEqual(await response.json(), { ok: true, status, editorMessageSaved: true, notificationSent: false });
  }
});

test("notes-only saves reject missing text and support clearing without changing status", async () => {
  const updates = [];
  const patch = await loadRouteForNotificationTest([{ id: "test-only", status: "published", editorMessage: "Old" }], [], async () => assert.fail("No email"), updates);
  const send = (body) => patch(new Request("https://test.invalid", { method: "PATCH", body: JSON.stringify(body) }), { params: Promise.resolve({ id: "test-only" }) });
  assert.equal((await send({ noteOnly: true })).status, 400);
  assert.equal((await send({ noteOnly: true, editorMessage: "" })).status, 200);
  assert.deepEqual(updates, [{ editorMessage: null }]);
});

test("requires one complete independent report, not two", async () => {
  const { hasRequiredIndependentReview, reviewerMatchesAuthor } = await loadReviewPolicy();
  const activeReviewerIds = new Set(["RV-1"]);
  assert.equal(reviewerMatchesAuthor({ name: " TEST AUTHOR ", email: "other@example.invalid" }, author), true);
  assert.equal(reviewerMatchesAuthor({ name: "Independent Reviewer", email: " AUTHOR@example.invalid " }, author), true);
  assert.equal(reviewerMatchesAuthor({ name: "Independent Reviewer", email: "reviewer@example.invalid" }, author), false);
  assert.equal(hasRequiredIndependentReview([], author, activeReviewerIds, "original"), false);
  assert.equal(hasRequiredIndependentReview([completeReview], author, activeReviewerIds, "original"), true);
  assert.equal(hasRequiredIndependentReview([completeReview], author, new Set(), "original"), false);
  assert.equal(hasRequiredIndependentReview([{ ...completeReview, reviewerApplicationId: null }], author, activeReviewerIds, "original"), false);
  assert.equal(hasRequiredIndependentReview([{ ...completeReview, recommendation: "decline" }], author, activeReviewerIds, "original"), true);
  assert.equal(hasRequiredIndependentReview([completeReview], author, activeReviewerIds, "SR-new-version"), false);
  assert.equal(hasRequiredIndependentReview([{ ...completeReview, manuscriptVersionId: null }], author, activeReviewerIds, "original"), false);
  for (const change of [
    { status: "in-progress" }, { status: "withdrawn" },
    { conflictConfirmed: false }, { confidentialityConfirmed: false },
    { questionScore: null }, { contextScore: 0 }, { methodScore: 6 }, { evidenceScore: 2.5 },
    { clarityScore: null }, { integrityScore: null },
    { recommendation: null }, { recommendation: "unknown" }, { comments: "Too short" },
    { reviewerEmail: " AUTHOR@example.invalid " }, { reviewerName: " test author " },
    { reviewerEmail: "not-an-email" }, { reviewerName: " " },
  ]) assert.equal(hasRequiredIndependentReview([{ ...completeReview, ...change }], author, activeReviewerIds, "original"), false, JSON.stringify(change));
});

test("review assignments can only link an active reviewer and start as drafts", async () => {
  const route = await source("app/api/editor/submissions/[id]/reviews/route.ts");
  const exports = {};
  const inserted = [];
  let reviewerRows = [];
  let revisionRows = [];
  let selectCount = 0;
  const db = {
    select() {
      const index = selectCount++;
      const rows = index === 0 ? [{ id: "submission-1", ...author }] : index === 1 ? reviewerRows : revisionRows;
      return { from() { return { where() { const query = Object.assign(Promise.resolve(rows), { limit: async () => rows, orderBy: () => query }); return query; } }; } };
    },
    insert() { return { values: async (row) => { inserted.push(row); } }; },
  };
  const modules = {
    "drizzle-orm": { and: () => {}, desc: () => {}, eq: () => {} },
    "../../../../../../lib/editor-auth": { getEditorForApi: async () => true },
    "../../../../../../db": { ensureSubmissionTable: async () => {}, getDb: () => db },
    "../../../../../../db/schema": { reviewerApplications: { id: "id", status: "status" }, reviewAssignments: {}, submissionRevisions: { id: "id", submissionId: "submissionId", versionNumber: "versionNumber" }, submissions: { id: "id", authorName: "authorName", authorEmail: "authorEmail" } },
    "../../../../../../lib/review-policy": await loadReviewPolicy(),
    "../../../../../../lib/reviewer-eligibility.mjs": { isReviewerEligibleForManuscriptAccess },
  };
  const compiled = ts.transpileModule(route, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "exports", compiled)((name) => { assert.ok(modules[name], name); return modules[name]; }, exports);
  const send = (body) => {
    selectCount = 0;
    return exports.POST(new Request("https://test.invalid", { method: "POST", body: JSON.stringify(body) }), { params: Promise.resolve({ id: "submission-1" }) });
  };
  assert.equal((await send({ reviewerName: "Made Up", reviewerEmail: "made-up@example.invalid" })).status, 400);
  assert.equal((await send({ reviewerApplicationId: "RV-active" })).status, 400);
  reviewerRows = [];
  assert.equal((await send({ reviewerApplicationId: "RV-inactive", manuscriptVersionId: "original" })).status, 409);
  revisionRows = [{ id: "SR-latest", versionNumber: 2 }];
  reviewerRows = [{ id: "RV-active", status: "active", fullName: "Approved Reviewer", email: "reviewer@example.invalid" }];
  assert.equal((await send({ reviewerApplicationId: "RV-active", manuscriptVersionId: "original" })).status, 409);
  revisionRows = [];
  reviewerRows = [{ id: "RV-active", status: "active", fullName: "Approved Reviewer", email: "reviewer@example.invalid" }];
  assert.equal((await send({ reviewerApplicationId: "RV-active", manuscriptVersionId: "original", dueAt: "2026-11-01" })).status, 200);
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].reviewerName, "Approved Reviewer");
  assert.equal(inserted[0].reviewerEmail, "reviewer@example.invalid");
  assert.equal(inserted[0].reviewerApplicationId, "RV-active");
  assert.equal(inserted[0].manuscriptVersionId, "original");
  assert.equal(inserted[0].status, "draft");
  reviewerRows = [{ id: "RV-self-email", status: "active", fullName: "Different Name", email: author.authorEmail }];
  assert.equal((await send({ reviewerApplicationId: "RV-self-email", manuscriptVersionId: "original" })).status, 409);
  reviewerRows = [{ id: "RV-self-name", status: "active", fullName: author.authorName, email: "different@example.invalid" }];
  assert.equal((await send({ reviewerApplicationId: "RV-self-name", manuscriptVersionId: "original" })).status, 409);
  reviewerRows = [{ id: "RV-minor", status: "active", ageBand: "minor", fullName: "Young Reviewer", email: "minor@example.invalid" }];
  assert.equal((await send({ reviewerApplicationId: "RV-minor", manuscriptVersionId: "original" })).status, 409);
  reviewerRows = [{ id: "RV-minor", status: "active", ageBand: "minor", guardianApprovalAt: "2026-10-13", guardianApprovalEvidence: "Guardian email verified Oct 13", fullName: "Young Reviewer", email: "minor@example.invalid" }];
  assert.equal((await send({ reviewerApplicationId: "RV-minor", manuscriptVersionId: "original" })).status, 200);
});

test("minor reviewers need separate guardian approval before activation or manuscript access", async () => {
  assert.equal(isReviewerEligibleForManuscriptAccess(null), false);
  assert.equal(isReviewerEligibleForManuscriptAccess({ status: "received", ageBand: "adult" }), false);
  assert.equal(isReviewerEligibleForManuscriptAccess({ status: "active", ageBand: "adult" }), true);
  assert.equal(isReviewerEligibleForManuscriptAccess({ status: "active", ageBand: "minor" }), false);
  assert.equal(isReviewerEligibleForManuscriptAccess({ status: "active", ageBand: "minor", guardianApprovalAt: "2026-10-13", guardianApprovalEvidence: "Guardian email received Oct 13" }), true);
  const [statusRoute, reviewRoute, editorPage, recruitmentPage, recruitmentActions, schema, database, submit] = await Promise.all([
    source("app/api/editor/reviewer-applications/[id]/status/route.ts"),
    source("app/api/editor/reviews/[id]/route.ts"),
    source("app/editor/page.tsx"),
    source("app/editor/recruitment/page.tsx"),
    source("app/editor/recruitment/RecruitmentActions.tsx"),
    source("db/schema.ts"),
    source("db/index.ts"),
    source("app/submit/page.tsx"),
  ]);
  assert.match(statusRoute, /Verify and record guardian approval before activating/);
  assert.match(reviewRoute, /isReviewerEligibleForManuscriptAccess\(activeReviewer\)/);
  assert.match(editorPage, /activeReviewerRecords\.filter\(isReviewerEligibleForManuscriptAccess\)/);
  assert.match(recruitmentPage, /guardianApprovalEvidence/);
  assert.match(recruitmentActions, /Guardian approval verified outside this application/);
  assert.match(schema, /guardianApprovalAt: text\("guardian_approval_at"\)/);
  assert.match(database, /\["guardian_approval_evidence", "text"\]/);
  assert.match(submit, /Names concealed where practical/);
  assert.doesNotMatch(submit, /Double-blind/);
});

test("acceptance and publication require a complete report from an active reviewer", async () => {
  for (const routeName of ["status", "publish"]) {
    for (const scenario of [
      { reviews: [], activeReviewers: [{ id: "RV-1" }], allowed: false },
      { reviews: [completeReview], activeReviewers: [], allowed: false },
      { reviews: [completeReview], activeReviewers: [{ id: "RV-1" }], allowed: true },
    ]) {
      const changes = [];
      let deliveries = 0;
      let selectCount = 0;
      const row = { id: "test-only", ...author, ageBand: "adult", guardianConfirmed: false, guardianEmail: null, status: routeName === "status" ? "under-review" : "accepted" };
      const selections = routeName === "status"
        ? [[row], scenario.reviews, scenario.activeReviewers, []]
        : [[row], scenario.reviews, scenario.activeReviewers, [], []];
      const db = {
        select() {
          const result = selections[selectCount++] ?? [];
          return { from() { return { where() { const query = Object.assign(Promise.resolve(result), { limit: async () => result, orderBy: () => query }); return query; } }; } };
        },
        update() { return { set(values) { changes.push(values); return { where: async () => {} }; } }; },
        insert() { return { values: async (values) => { changes.push(values); } }; },
      };
      const modules = {
        "drizzle-orm": { eq: () => {}, and: () => {}, desc: () => {}, inArray: () => {} },
        "../../../../../../lib/editor-auth": { getEditorForApi: async () => true },
        "../../../../../../db": { ensureSubmissionTable: async () => {}, getDb: () => db },
        "../../../../../../db/schema": { submissions: {}, publishedArticles: {}, reviewerApplications: {}, reviewAssignments: {}, submissionNotificationEvents: {}, submissionRevisions: { id: "id", submissionId: "submissionId", versionNumber: "versionNumber" } },
        "../../../../../../lib/review-policy": await loadReviewPolicy(),
        "../../../../../../lib/publication-approval.mjs": await import("../lib/publication-approval.mjs"),
        "../../../../../../lib/submission-notifications": { sendStatusNotifications: async () => { deliveries++; return []; } },
      };
      const exports = {};
      const compiled = ts.transpileModule(await source(`app/api/editor/submissions/[id]/${routeName}/route.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
      new Function("require", "exports", compiled)((name) => { assert.ok(modules[name], name); return modules[name]; }, exports);
      const payload = routeName === "status" ? { status: "accepted" } : {
        title: "Test-only manuscript", authorName: author.authorName, discipline: "History",
        abstract: "A".repeat(90), body: "Test-only manuscript content. ".repeat(15), authorApprovalConfirmed: true,
        manuscriptVersionId: "original",
        authorAgeStatus: "adult", ageStatusEvidence: "Submission record, 2026-10-12",
        authorApprovalEvidence: "Author email, 2026-10-12: approved exact text",
      };
      const method = routeName === "status" ? "PATCH" : "POST";
      const response = await exports[method](new Request("https://test.invalid", { method, body: JSON.stringify(payload) }), { params: Promise.resolve({ id: "test-only" }) });
      assert.equal(response.status, scenario.allowed ? (routeName === "publish" ? 201 : 200) : 409);
      assert.equal(deliveries, scenario.allowed ? 1 : 0);
      assert.equal(changes.length > 0, scenario.allowed);
    }
  }
});

test("public release approval is tied to the exact public version", async () => {
  const article = {
    title: "Test title", authorName: "Test Author", discipline: "History", abstract: "A".repeat(100),
    abstractNative: null, abstractNativeLanguage: null, submissionType: "article", dataSourceUrl: null,
    codeUrl: null, body: "Version one", issue: "Volume 01", manuscriptVersionId: "original",
  };
  const original = await hashPublicVersion(article);
  assert.match(original, /^[a-f0-9]{64}$/);
  assert.equal(await hashPublicVersion({ ...article }), original);
  assert.notEqual(await hashPublicVersion({ ...article, body: "Version two" }), original);
  assert.notEqual(await hashPublicVersion({ ...article, authorName: "Approved pseudonym" }), original);
  assert.notEqual(await hashPublicVersion({ ...article, manuscriptVersionId: "SR-revision-2" }), original);
  assert.equal(isKnownMinorSubmission({ ageBand: "under-18", guardianConfirmed: false, guardianEmail: null }), true);
  assert.equal(isKnownMinorSubmission({ ageBand: "adult", guardianConfirmed: false, guardianEmail: null }), false);
  assert.equal(hasEvidenceNote("Author email, 2026-10-12"), true);
  assert.equal(hasEvidenceNote("yes"), false);
});

test("publication rejects an under-18 author without guardian release evidence", async () => {
  const route = await source("app/api/editor/submissions/[id]/publish/route.ts");
  const exports = {};
  const minor = {
    id: "minor-submission", authorName: "Minor Author", authorEmail: "author@example.invalid",
    ageBand: "under-18", guardianEmail: "guardian@example.invalid", guardianConfirmed: true,
    status: "accepted", manuscriptTitle: "Private test", discipline: "History", abstract: "A".repeat(300),
  };
  let selectCount = 0;
  const db = { select() { selectCount++; return { from() { return { where() { return { limit: async () => [minor] }; } }; } }; } };
  const modules = {
    "drizzle-orm": { eq: () => {} },
    "../../../../../../lib/editor-auth": { getEditorForApi: async () => true },
    "../../../../../../db": { ensureSubmissionTable: async () => {}, getDb: () => db },
    "../../../../../../db/schema": { publicationReleaseApprovals: {}, publishedArticles: {}, reviewerApplications: {}, reviewAssignments: {}, submissions: {} },
    "../../../../../../lib/review-policy": { hasRequiredIndependentReview: () => true },
    "../../../../../../lib/publication-approval.mjs": await import("../lib/publication-approval.mjs"),
    "../../../../../../lib/submission-notifications": { sendStatusNotifications: async () => [] },
  };
  const compiled = ts.transpileModule(route, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "exports", compiled)((name) => { assert.ok(modules[name], name); return modules[name]; }, exports);
  const response = await exports.POST(new Request("https://test.invalid", {
    method: "POST",
    body: JSON.stringify({
      title: "Private test", authorName: "Minor Author", discipline: "History", abstract: "A".repeat(90),
      body: "A public article draft. ".repeat(12), authorApprovalConfirmed: true, authorAgeStatus: "under-18",
      ageStatusEvidence: "Guardian-confirmed intake, 2026-10-12", authorApprovalEvidence: "Author email, 2026-10-12",
    }),
  }), { params: Promise.resolve({ id: minor.id }) });
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /guardian's approval/i);
  assert.equal(selectCount, 1);
});

test("public policies consistently describe one written review", async () => {
  const review = await source("app/review/page.tsx");
  assert.match(review, /still looking for reviewers in some subject areas/);
  for (const path of ["app/site.ts", "app/review/page.tsx", "app/policies/page.tsx", "app/guide/page.tsx", "app/share/page.tsx", "app/submit/[slug]/page.tsx", "app/updates/page.tsx", "app/editor/page.tsx"]) {
    const content = await source(path);
    assert.doesNotMatch(content, /two (written |trained student |submitted |independent )?(reviews|reviewers)/i, path);
    assert.match(content, /one (complete |completed |qualified )?(written )?(review|reviewer)/i, path);
    assert.doesNotMatch(content, /independent human peer review/i, path);
  }
  const editor = await source("app/editor/page.tsx");
  assert.match(editor, /hasRequiredIndependentReview\(reviewsBySubmission/);
  assert.doesNotMatch(editor, /submittedReviewCount < 2|\/2 submitted review records/);
  const metrics = await source("app/api/public-metrics/route.ts");
  assert.match(metrics, /writtenReviewsPerEligibleManuscript:\s*1\b/);
  for (const path of ["app/site.ts", "app/review/page.tsx", "app/guide/page.tsx", "app/share/page.tsx", "app/updates/page.tsx", "app/api/public-metrics/route.ts"]) {
    const content = await source(path);
    assert.doesNotMatch(content, /six to eight weeks|weeks 2 to 5|within 7 days|target: weeks 6 to 8/i, path);
  }
});

test("preserves failed acceptance-email retries for an already accepted legacy record", async () => {
  let deliveries = 0;
  const patch = await loadRouteForNotificationTest(
    [{ id: "test-only", ...author, status: "accepted", editorMessage: null }],
    [{ eventKey: "author:accepted", status: "failed" }],
    async () => { deliveries++; return []; },
  );
  const response = await patch(new Request("https://test.invalid", { method: "PATCH", body: JSON.stringify({ status: "accepted" }) }), { params: Promise.resolve({ id: "test-only" }) });
  assert.equal(response.status, 200);
  assert.equal(deliveries, 1);
});

test("retries a failed notification when the editor saves the unchanged decision", async () => {
  const calls = [];
  const patch = await loadRouteForNotificationTest(
    [{ id: "test-only", status: "revise", editorMessage: "Please revise." }],
    [{ eventKey: "author:revise", status: "failed" }],
    async (...args) => { calls.push(args); return []; },
  );
  const response = await patch(new Request("https://test.invalid/status", { method: "PATCH", body: JSON.stringify({ status: "revise", editorMessage: "Please revise." }) }), { params: Promise.resolve({ id: "test-only" }) });
  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0][4], { existingOnly: true });
});

test("does not send for an unchanged decision without an unsent event", async () => {
  for (const events of [[], [{ eventKey: "author:revise", status: "sent" }]]) {
    let calls = 0;
    const patch = await loadRouteForNotificationTest(
      [{ id: "test-only", status: "revise", editorMessage: null }], events,
      async () => { calls++; return []; },
    );
    const response = await patch(new Request("https://test.invalid/status", { method: "PATCH", body: JSON.stringify({ status: "revise" }) }), { params: Promise.resolve({ id: "test-only" }) });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).notificationSent, false);
    assert.equal(calls, 0);
  }
});

test("keeps a repeated delivery failure visible to the editor", async () => {
  const patch = await loadRouteForNotificationTest(
    [{ id: "test-only", status: "revise", editorMessage: null }],
    [{ eventKey: "author:revise", status: "failed" }],
    async () => ["Test delivery failure"],
  );
  const response = await patch(new Request("https://test.invalid/status", { method: "PATCH", body: JSON.stringify({ status: "revise" }) }), { params: Promise.resolve({ id: "test-only" }) });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).notificationPending, true);
});

test("retry mode sends only existing unsent events without creating or duplicating mail", async () => {
  for (const events of [
    [[{ id: "author-event", status: "failed" }], [{ id: "editor-event", status: "sent" }]],
    [[], []],
    [[{ id: "author-event", status: "sent" }], [{ id: "editor-event", status: "sent" }]],
  ]) {
    let selections = 0;
    let authorSends = 0;
    let editorSends = 0;
    const updates = [];
    const db = {
      select() { const result = events[selections++]; return { from() { return { where() { return { limit: async () => result }; } }; } }; },
      insert() { assert.fail("Retry must not create notification events"); },
      update() { return { set(values) { updates.push(values); return { where: async () => {} }; } }; },
    };
    const modules = {
      "drizzle-orm": { eq: () => {}, and: () => {} },
      "../db/schema": { submissions: {}, submissionNotificationEvents: {} },
      "./notifications": {
        notifyAuthorOfDecision: async () => { authorSends++; return { sent: true }; },
        notifyEditorOfPublication: async () => { editorSends++; return { sent: true }; },
      },
    };
    const exports = {};
    const compiled = ts.transpileModule(await source("lib/submission-notifications.ts"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    new Function("require", "exports", compiled)((name) => {
      assert.ok(modules[name], `Unexpected workflow dependency: ${name}`);
      return modules[name];
    }, exports);
    const reasons = await exports.sendStatusNotifications(db, { id: "test-only" }, "published", "/articles/test-only", { existingOnly: true });
    assert.deepEqual(reasons, []);
    assert.equal(authorSends, events[0][0]?.status === "failed" ? 1 : 0);
    assert.equal(editorSends, 0);
    assert.equal(updates.length, authorSends);
    if (updates.length) assert.equal(updates[0].status, "sent");
  }
});

test("keeps the public journal routes and policy content in source", async () => {
  const [home, policies, submit, guide, share] = await Promise.all([
    source("app/page.tsx"),
    source("app/policies/page.tsx"),
    source("app/submit/page.tsx"),
    source("app/guide/page.tsx"),
    source("app/share/page.tsx"),
  ]);
  assert.match(home, /Student research,/);
  assert.match(policies, /How we handle submissions\./);
  assert.match(policies, /Privacy, minors and guardian contact/);
  assert.match(submit, /SubmissionForm/);
  assert.match(submit, /student-research/);
  assert.match(guide, /student-research/);
  assert.match(share, /student research route/);
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
    source("drizzle/0008_publication_release_approvals.sql"),
  ]);
  assert.match(publishRoute, /authorApprovalConfirmed/);
  assert.match(publishRoute, /Only an accepted submission can be published/);
  assert.match(publishRoute, /publishedArticles/);
  assert.match(publishRoute, /sendStatusNotifications/);
  assert.match(editorForm, /Publish article/);
  assert.match(editorForm, /author-approved/);
  assert.match(editorForm, /Private release record/);
  assert.match(editorForm, /guardianApprovalConfirmed/);
  assert.match(publishRoute, /publicationReleaseApprovals/);
  assert.match(publishRoute, /authorApprovalEvidence/);
  assert.match(publishRoute, /guardianApprovalEvidence/);
  assert.match(publishRoute, /hashPublicVersion/);
  assert.match(articlePage, /notFound/);
  assert.match(articlePage, /publishedArticles/);
  assert.match(issuePage, /publishedArticles/);
  assert.match(issuePage, /articles\//);
  assert.match(schema, /publishedArticles/);
  assert.match(schema, /publicationReleaseApprovals/);
  assert.match(database, /published_articles/);
  assert.match(database, /publication_release_approvals/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS/);
  assert.match(migration, /public_version_hash/);
  assert.doesNotMatch(articlePage, /—/);
});

test("keeps manuscript PDFs readable in the editor and public article copies printable", async () => {
  const [manuscriptRoute, editorPage, articlePage, readingActions, styles] = await Promise.all([
    source("app/api/editor/submissions/[id]/manuscript/route.ts"),
    source("app/editor/page.tsx"),
    source("app/articles/[slug]/page.tsx"),
    source("app/articles/ArticleReadingActions.tsx"),
    source("app/globals.css"),
  ]);
  assert.match(manuscriptRoute, /Content-Disposition/);
  assert.match(manuscriptRoute, /inline/);
  assert.match(manuscriptRoute, /download/);
  assert.match(editorPage, /Open PDF/);
  assert.match(editorPage, /Download manuscript/);
  assert.match(articlePage, /ArticleReadingActions/);
  assert.match(readingActions, /window\.print/);
  assert.match(readingActions, /save as PDF/);
  assert.match(styles, /@media print\s*\{[\s\S]*?\.skip-link[\s\S]*?display: none !important/);
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
  const [statusRoute, statusPage, home, issue, share, shareButton] = await Promise.all([
    source("app/api/submission-status/route.ts"),
    source("app/status/page.tsx"),
    source("app/page.tsx"),
    source("app/issue/page.tsx"),
    source("app/share/page.tsx"),
    source("app/share/CopyShareButton.tsx"),
  ]);
  assert.match(statusRoute, /submissions\.authorEmail/);
  assert.match(statusRoute, /submissions\.id/);
  assert.match(statusPage, /SubmissionStatusForm/);
  assert.match(share, /Copy and send/);
  assert.match(share, /makeShareText/);
  assert.match(share, /CopyShareButton/);
  assert.match(shareButton, /navigator\.clipboard/);
  assert.match(share, /Students submit directly/);
  assert.doesNotMatch(home, /—/);
  assert.doesNotMatch(issue, /—/);
  assert.doesNotMatch(share, /—/);
});

test("keeps public publication evidence and discovery metadata connected", async () => {
  const [home, transparency, article, sitemap, robots, launchKit, readiness, updates] = await Promise.all([
    source("app/page.tsx"),
    source("app/transparency/page.tsx"),
    source("app/articles/[slug]/page.tsx"),
    source("app/sitemap.ts"),
    source("app/robots.ts"),
    source("docs/pilot-launch-kit.md"),
    source("docs/scopus-readiness.md"),
    source("app/updates/page.tsx"),
  ]);
  assert.match(home, /getPublishedArticles/);
  assert.match(home, /unreviewed pilot record/);
  assert.match(home, /written human review per manuscript/);
  assert.match(transparency, /1×/);
  assert.match(transparency, /Written human review per eligible manuscript/);
  assert.match(transparency, /Public record entries/);
  assert.match(transparency, /Authors retain copyright/);
  assert.match(article, /CreativeWork/);
  assert.match(article, /Suggested citation/);
  assert.match(article, /canonical/);
  assert.match(sitemap, /openmargin\.org/);
  assert.match(sitemap, /articles\//);
  assert.match(robots, /sitemap\.xml/);
  assert.match(launchKit, /https:\/\/openmargin\.org\/submit/);
  assert.match(readiness, /not in Scopus/);
  assert.match(updates, /complete review cycle/);
  assert.match(updates, /Evidence before reputation/);
  assert.match(sitemap, /"\/updates"/);
  assert.doesNotMatch(transparency, /—/);
  assert.doesNotMatch(updates, /—/);
});

test("keeps the public record audit visible and explicit", async () => {
  const [shell, notice, home, issue, updates, transparency, metrics] = await Promise.all([
    source("app/components/SiteShell.tsx"),
    source("app/components/PublicRecordNotice.tsx"),
    source("app/page.tsx"),
    source("app/issue/page.tsx"),
    source("app/updates/page.tsx"),
    source("app/transparency/page.tsx"),
    source("app/api/public-metrics/route.ts"),
  ]);
  assert.match(shell, /PublicRecordNotice/);
  assert.match(notice, /unreviewed pilot records/);
  assert.match(notice, /readable-file evidence/);
  assert.match(home, /under public audit/);
  assert.match(issue, /Volume 01 is being reconciled/);
  assert.match(updates, /public record/);
  assert.match(transparency, /public record is under audit/);
  assert.match(metrics, /publicRecordStatus/);
  assert.match(metrics, /publishedArticleCount: 0/);
});

test("keeps review assignments version-bound, private, and durable", async () => {
  const [schema, database, migration, versionMigration, createRoute, updateRoute, editorPage, reviewForm] = await Promise.all([
    source("db/schema.ts"),
    source("db/index.ts"),
    source("drizzle/0005_review_assignments.sql"),
    source("drizzle/0008_version_bound_reviews.sql"),
    source("app/api/editor/submissions/[id]/reviews/route.ts"),
    source("app/api/editor/reviews/[id]/route.ts"),
    source("app/editor/page.tsx"),
    source("app/editor/ReviewAssignments.tsx"),
  ]);
  assert.match(schema, /reviewAssignments/);
  assert.match(database, /review_assignments/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS `review_assignments`/);
  assert.match(versionMigration, /review_assignments.*manuscript_version_id/s);
  assert.match(versionMigration, /published_articles.*manuscript_version_id/s);
  assert.match(database, /addMissingColumns\(db, "review_assignments"/);
  assert.match(createRoute, /getEditorForApi/);
  assert.match(createRoute, /reviewerEmail/);
  assert.match(createRoute, /manuscriptVersionId !== latestManuscriptVersionId/);
  assert.match(updateRoute, /conflictConfirmed/);
  assert.match(updateRoute, /six scores/);
  assert.match(updateRoute, /assignment\.manuscriptVersionId !== latestManuscriptVersionId/);
  assert.match(editorPage, /reviewsBySubmission/);
  assert.match(editorPage, /Reviews submitted/);
  assert.match(reviewForm, /Review records/);
  assert.match(reviewForm, /Save review record/);
});

test("keeps operating documentation aligned with the live product", async () => {
  const [readme, releaseChecklist, monthOne, sprint, copyPack, reviewerPack] = await Promise.all([
    source("README.md"),
    source("docs/release-checklist.md"),
    source("docs/month-one-delivery.md"),
    source("docs/marketing-sprint.md"),
    source("docs/marketing-copy-pack.md"),
    source("docs/reviewer-recruitment-pack.md"),
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
  assert.match(reviewerPack, /Do not send a manuscript or a student name/);
  assert.match(reviewerPack, /one follow-up after five business days/);
});

test("keeps marketing attribution private and useful", async () => {
  const [schema, database, migration, route, form, editorPage, marketingPage, copyCampaignLinkButton, guide, layout, attribution, campaign] = await Promise.all([
    source("db/schema.ts"),
    source("db/index.ts"),
    source("drizzle/0006_campaign_attribution.sql"),
    source("app/api/submissions/route.ts"),
    source("app/submit/SubmissionForm.tsx"),
    source("app/editor/page.tsx"),
    source("app/editor/marketing/page.tsx"),
    source("app/editor/marketing/CopyCampaignLinkButton.tsx"),
    source("app/guide/page.tsx"),
    source("app/layout.tsx"),
    source("app/components/CampaignAttribution.tsx"),
    source("lib/campaign.ts"),
  ]);
  assert.match(schema, /campaignSource/);
  assert.match(database, /campaign_source text/);
  assert.match(migration, /ADD `campaign_name` text/);
  assert.match(route, /landingPath/);
  assert.match(form, /utm_source/);
  assert.match(form, /sessionStorage/);
  assert.match(form, /campaignStorageKey/);
  assert.match(form, /typeof window === "undefined"/);
  assert.match(form, /formData\.set\("campaignSource"/);
  assert.match(attribution, /sessionStorage.setItem/);
  assert.match(campaign, /withCampaign/);
  assert.match(guide, /submitHref/);
  assert.match(editorPage, /Marketing desk/);
  assert.match(marketingPage, /requireEditor/);
  assert.match(marketingPage, /does not collect IP addresses/);
  assert.match(marketingPage, /reviewerApplications/);
  assert.match(marketingPage, /partnerInquiries/);
  assert.match(marketingPage, /Reviewer applications/);
  assert.match(marketingPage, /Partner inquiries/);
  assert.match(marketingPage, /Ready-to-share links/);
  assert.match(marketingPage, /utm_campaign=fall-2026/);
  assert.match(marketingPage, /CopyCampaignLinkButton/);
  assert.match(copyCampaignLinkButton, /navigator\.clipboard/);
  assert.match(guide, /FAQPage/);
  assert.match(guide, /Who can submit/);
  assert.match(layout, /https:\/\/openmargin\.org/);
  assert.doesNotMatch(layout, /x-forwarded-host/);
});

test("keeps the high-intent submission paths discoverable", async () => {
  const [pathPage, submitPage, sitemap, campaign] = await Promise.all([
    source("app/submit/[slug]/page.tsx"),
    source("app/submit/page.tsx"),
    source("app/sitemap.ts"),
    source("app/editor/marketing/page.tsx"),
  ]);
  assert.match(pathPage, /ap-research/);
  assert.match(pathPage, /research-note/);
  assert.match(pathPage, /class-project/);
  assert.match(pathPage, /FAQPage/);
  assert.match(submitPage, /Common starting points/);
  assert.match(sitemap, /submit\/ap-research/);
  assert.match(sitemap, /submit\/research-note/);
  assert.match(sitemap, /submit\/class-project/);
  assert.match(campaign, /school_research/);
  assert.match(campaign, /student_research/);
  assert.match(campaign, /utm_source=research/);
});

test("keeps a public-record audit visible to editors", async () => {
  const [editor, styles] = await Promise.all([
    source("app/editor/page.tsx"),
    source("app/globals.css"),
  ]);
  assert.match(editor, /publicRecordWarnings/);
  assert.match(editor, /hasRequiredIndependentReview/);
  assert.match(editor, /author or guardian approval/);
  assert.match(editor, /no recorded approval for the current public version/);
  assert.match(editor, /current public version does not match its recorded approval/);
  assert.match(styles, /\.editor-notice ul/);
});

test("supports bilingual abstracts and research notes", async () => {
  const [schema, database, form, route, article, submitPage, publishRoute] = await Promise.all([
    source("db/schema.ts"),
    source("db/index.ts"),
    source("app/submit/SubmissionForm.tsx"),
    source("app/api/submissions/route.ts"),
    source("app/articles/[slug]/page.tsx"),
    source("app/submit/page.tsx"),
    source("app/api/editor/submissions/[id]/publish/route.ts"),
  ]);
  assert.match(schema, /abstractNative/);
  assert.match(schema, /submissionType/);
  assert.match(database, /abstract_native/);
  assert.match(form, /abstractNativeLanguage/);
  assert.match(form, /research-note/);
  assert.match(route, /Please give both the language and the abstract text/);
  assert.match(route, /Research notes run between 1,500 and 3,000 words/);
  assert.match(route, /Research notes need a link to the dataset you used/);
  assert.match(route, /Please give a full https link/);
  assert.match(article, /abstractNative/);
  assert.match(article, /lang:/);
  assert.match(article, /Research note/);
  assert.match(submitPage, /A research note is a short paper, 1,500 to 3,000 words/);
  assert.match(publishRoute, /abstractNative/);
});

test("publishes the language policy and reviewer guidance", async () => {
  const [policies, review, reviewers, about] = await Promise.all([
    source("app/policies/page.tsx"),
    source("app/review/page.tsx"),
    source("app/reviewers/page.tsx"),
    source("app/about/page.tsx"),
  ]);
  assert.match(policies, /id: "language"/);
  assert.match(policies, /not a first language/);
  assert.match(review, /Fluency is not a scoring criterion/);
  assert.match(reviewers, /public rubric and sample reviews/);
  assert.match(reviewers, /conflicts fit/);
  assert.doesNotMatch(reviewers, /calibration exercise/);
  assert.doesNotMatch(about, /calibration/);
});

test("prints a readable public article copy", async () => {
  const [article, actions, styles] = await Promise.all([
    source("app/articles/[slug]/page.tsx"),
    source("app/articles/ArticleReadingActions.tsx"),
    source("app/globals.css"),
  ]);
  assert.match(article, /Unreviewed pilot record/);
  assert.match(actions, /Print or save as PDF/);
  assert.match(styles, /@page \{ margin: 16mm; \}/);
  assert.match(styles, /article-aside \{ border-top: 1px solid #777; padding-top: \.5rem; position: static; \}/);
  assert.match(styles, /\.article-text p \{ font-size: 11pt; line-height: 1\.55; margin: 0 0 \.9rem; orphans: 3; widows: 3; \}/);
});

test("captures reviewer routing details and the PhD target", async () => {
  const [schema, database, form, route, recruitment] = await Promise.all([
    source("db/schema.ts"),
    source("db/index.ts"),
    source("app/reviewers/ReviewerApplicationForm.tsx"),
    source("app/api/reviewer-applications/route.ts"),
    source("app/editor/recruitment/page.tsx"),
  ]);
  assert.match(schema, /timezone/);
  assert.match(database, /highest_qualification/);
  assert.match(form, /supportedValuesOf/);
  assert.match(route, /validTimezone/);
  assert.match(recruitment, /PhD-qualified advisers/);
  assert.match(recruitment, /formatLocalTime/);
});

test("gates calls for papers and guardian email corrections", async () => {
  const [site, calls, call, sitemap, submit, editor, guardianRoute, notifications, assetCheck, nextConfig] = await Promise.all([
    source("app/site.ts"),
    source("app/calls/page.tsx"),
    source("app/calls/[slug]/page.tsx"),
    source("app/sitemap.ts"),
    source("app/submit/SubmissionForm.tsx"),
    source("app/editor/page.tsx"),
    source("app/api/editor/submissions/[id]/guardian-email/route.ts"),
    source("lib/notifications.ts"),
    source("scripts/check-asset-weight.mjs"),
    source("next.config.mjs"),
  ]);
  assert.match(site, /publishableCalls/);
  assert.match(site, /PLACEHOLDER/);
  assert.match(calls, /notFound/);
  assert.match(call, /submit\?call=/);
  assert.match(sitemap, /publishableCalls/);
  assert.match(submit, /callSlug/);
  assert.match(editor, /callSlug/);
  assert.match(guardianRoute, /getEditorForApi/);
  assert.match(guardianRoute, /guardian-email-corrected/);
  assert.match(notifications, /notifyGuardianOfSubmission/);
  assert.match(assetCheck, /500 \* 1024/);
  assert.match(nextConfig, /image\/webp/);
});
