import process from "node:process";

const sourceUrl = process.env.OPEN_MARGIN_PUBLIC_METRICS_URL || "https://openmargin.org/api/public-metrics";
const endpoint = process.env.AZURE_PUBLIC_METRICS_ENDPOINT || "";
const functionKey = process.env.AZURE_FUNCTION_KEY || "";

const response = await fetch(sourceUrl, { headers: { accept: "application/json" } });
if (!response.ok) {
  throw new Error(`Open Margin metrics request failed with HTTP ${response.status}`);
}

const publicMetrics = await response.json();
const metrics = {
  publishedArticleCount: publicMetrics.publishedArticleCount,
  publicDisciplines: publicMetrics.publicDisciplines,
  latestPublishedAt: publicMetrics.latestPublishedAt,
  reviewPolicy: publicMetrics.reviewPolicy,
};

if (!endpoint) {
  console.log(JSON.stringify({ project: "open-margin", metrics }, null, 2));
  process.exit(0);
}

const upload = await fetch(endpoint, {
  method: "POST",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    ...(functionKey ? { "x-functions-key": functionKey } : {}),
  },
  body: JSON.stringify({
    project: "open-margin",
    metrics,
    notes: "Public-only Open Margin metrics. No submissions, manuscripts, authors, or reviewer identities.",
    artifactUrls: [],
  }),
});

if (!upload.ok) {
  throw new Error(`Azure metrics upload failed with HTTP ${upload.status}`);
}

console.log(await upload.text());
