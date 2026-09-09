import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("public metrics route is explicitly aggregate-only", () => {
  const route = fs.readFileSync(new URL("../app/api/public-metrics/route.ts", import.meta.url), "utf8");
  assert.match(route, /publishedArticleCount/);
  assert.match(route, /publicDisciplines/);
  assert.doesNotMatch(route, /authorEmail|manuscriptKey|reviewerEmail|abstract/);
});
