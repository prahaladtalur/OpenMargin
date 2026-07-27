import { env } from "cloudflare:workers";

type SubmissionNotification = {
  id: string;
  authorName: string;
  manuscriptTitle: string;
  discipline: string;
  ageBand: string;
};

export async function notifyEditorOfSubmission(submission: SubmissionNotification) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM || !env.NOTIFICATION_EMAIL) {
    return { sent: false, reason: "Email provider is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to: [env.NOTIFICATION_EMAIL],
      subject: `New Open Margin submission: ${submission.manuscriptTitle}`,
      text: [
        "A new manuscript has been received.",
        "",
        `Reference: ${submission.id}`,
        `Title: ${submission.manuscriptTitle}`,
        `Author: ${submission.authorName}`,
        `Discipline: ${submission.discipline}`,
        `Author age band: ${submission.ageBand}`,
        "",
        "Open the private editor to review the submission and download the blinded manuscript.",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    console.error("Submission notification failed", response.status, await response.text());
    return { sent: false, reason: "Email provider rejected the request." };
  }

  return { sent: true };
}
