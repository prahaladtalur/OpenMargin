import { and, eq } from "drizzle-orm";
import { ensureSubmissionTable, getDb } from "../../../db";
import { submissions } from "../../../db/schema";

const statusLabels: Record<string, { label: string; detail: string }> = {
  received: { label: "Received", detail: "Your manuscript is in the editorial queue for an initial screen." },
  screening: { label: "Initial screen", detail: "An editor is checking fit, completeness, and review readiness." },
  "under-review": { label: "Under review", detail: "The manuscript is in the double-blind review process." },
  revise: { label: "Revision requested", detail: "An editor has recorded a revision stage. Check your editorial correspondence for the next step." },
  declined: { label: "Decision recorded", detail: "An editorial decision has been recorded. Check your editorial correspondence for details." },
  accepted: { label: "Accepted", detail: "The manuscript is moving through final revision and publication preparation." },
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null) as { reference?: unknown; email?: unknown } | null;
    const reference = clean(payload?.reference, 50).toUpperCase();
    const email = clean(payload?.email, 254).toLowerCase();
    if (!reference || !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter your reference code and the email you used to submit." }, { status: 400 });

    await ensureSubmissionTable();
    const [submission] = await getDb()
      .select({ status: submissions.status, createdAt: submissions.createdAt })
      .from(submissions)
      .where(and(eq(submissions.id, reference), eq(submissions.authorEmail, email)))
      .limit(1);

    if (!submission) return Response.json({ error: "We could not find a submission with that reference code and email." }, { status: 404 });
    const state = statusLabels[submission.status] ?? { label: "In progress", detail: "Your manuscript is in the editorial process." };
    return Response.json({ ...state, createdAt: submission.createdAt });
  } catch (error) {
    console.error("Submission status lookup failed", error);
    return Response.json({ error: "We could not retrieve your submission status. Try again shortly." }, { status: 500 });
  }
}
