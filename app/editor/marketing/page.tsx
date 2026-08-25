import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { ensureSubmissionTable, getDb } from "../../../db";
import { submissions } from "../../../db/schema";
import { editorSignOutPath, requireEditor } from "../../../lib/editor-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Marketing desk" };

type CampaignRow = {
  source: string;
  medium: string;
  name: string;
  submissions: number;
  reviewed: number;
  accepted: number;
  published: number;
};

export default async function MarketingDeskPage() {
  await requireEditor("/editor/marketing");
  await ensureSubmissionTable();
  const rows = await getDb().select({
    status: submissions.status,
    campaignSource: submissions.campaignSource,
    campaignMedium: submissions.campaignMedium,
    campaignName: submissions.campaignName,
  }).from(submissions).orderBy(desc(submissions.createdAt)).limit(500);

  const campaignMap = new Map<string, CampaignRow>();
  for (const row of rows) {
    const source = row.campaignSource || "direct";
    const medium = row.campaignMedium || "none";
    const name = row.campaignName || "untagged";
    const key = `${source}\u0000${medium}\u0000${name}`;
    const current = campaignMap.get(key) ?? { source, medium, name, submissions: 0, reviewed: 0, accepted: 0, published: 0 };
    current.submissions += 1;
    if (row.status !== "received" && row.status !== "screening") current.reviewed += 1;
    if (row.status === "accepted" || row.status === "published") current.accepted += 1;
    if (row.status === "published") current.published += 1;
    campaignMap.set(key, current);
  }
  const campaigns = [...campaignMap.values()].sort((left, right) => right.submissions - left.submissions);
  const tagged = rows.filter((row) => row.campaignSource || row.campaignName).length;

  return (
    <main className="editor-page">
      <header className="editor-header"><div><p className="eyebrow">Private editorial workspace</p><h1>Marketing desk</h1><p>Measure tagged submissions without tracking people across the web.</p></div><div className="editor-header-actions"><Link href="/editor" className="editor-link">Submission desk</Link><Link href="/editor/recruitment" className="editor-link">Recruitment desk</Link><Link href={editorSignOutPath("/")} className="editor-link">Sign out</Link></div></header>
      <section className="editor-notice configured"><p><strong>Privacy boundary:</strong> this report stores only campaign labels submitted with a form. It does not collect IP addresses, device IDs, or browsing history.</p></section>
      <section className="editor-summary" aria-label="Marketing summary"><div><span>{rows.length}</span><p>Submissions</p></div><div><span>{tagged}</span><p>Tagged submissions</p></div><div><span>{rows.filter((row) => row.status === "accepted" || row.status === "published").length}</span><p>Accepted</p></div><div><span>{rows.filter((row) => row.status === "published").length}</span><p>Published</p></div></section>
      <section className="editor-list"><div className="editor-list-heading"><p className="eyebrow">Campaign attribution</p><p>Use UTM links from the marketing calendar.</p></div>{campaigns.length === 0 ? <div className="editor-empty"><h2>No submissions yet.</h2><p>Tagged campaigns will appear after an author submits through a campaign link.</p></div> : <div className="marketing-table-wrap"><table className="marketing-table"><thead><tr><th>Source</th><th>Medium</th><th>Campaign</th><th>Submissions</th><th>Reviewed</th><th>Accepted</th><th>Published</th></tr></thead><tbody>{campaigns.map((campaign) => <tr key={`${campaign.source}-${campaign.medium}-${campaign.name}`}><td>{campaign.source}</td><td>{campaign.medium}</td><td>{campaign.name}</td><td>{campaign.submissions}</td><td>{campaign.reviewed}</td><td>{campaign.accepted}</td><td>{campaign.published}</td></tr>)}</tbody></table></div>}</section>
      <section className="marketing-next"><p className="eyebrow">How to use this desk</p><ol><li>Give each channel one clear UTM campaign name.</li><li>Count qualified submissions, not clicks or follower totals.</li><li>Stop a channel when it creates noise or pressure instead of good-fit work.</li></ol><Link className="button button-paper" href="/share">Open the share page</Link></section>
    </main>
  );
}
