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
  assert.match(home, /Serious work deserves/);
  assert.match(policies, /Clear standards\. No hidden rules\./);
  assert.match(policies, /Privacy, minors & guardian contact/);
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

test("keeps editorial review surfaces private", async () => {
  const [editorPage, editorAuth, statusRoute] = await Promise.all([
    source("app/editor/page.tsx"),
    source("lib/editor-auth.ts"),
    source("app/api/editor/submissions/[id]/status/route.ts"),
  ]);
  assert.match(editorPage, /requireEditor/);
  assert.match(editorAuth, /EDITOR_EMAILS/);
  assert.match(statusRoute, /getEditorForApi/);
});
