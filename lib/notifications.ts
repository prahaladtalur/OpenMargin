import { env } from "cloudflare:workers";

type SubmissionNotification = {
  id: string;
  authorName: string;
  manuscriptTitle: string;
  discipline: string;
  guardianConfirmed: boolean;
};

type ReviewerApplicationNotification = {
  id: string;
  fullName: string;
  role: string;
  disciplines: string;
};

type PartnerInquiryNotification = {
  id: string;
  organizationName: string;
  contactName: string;
  organizationType: string;
  requestedPath: string;
};

async function sendEditorNotification(subject: string, lines: string[]) {
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
      subject,
      text: lines.join("\n"),
    }),
  });

  if (!response.ok) {
    console.error("Editorial notification failed", response.status, await response.text());
    return { sent: false, reason: "Email provider rejected the request." };
  }

  return { sent: true };
}

export async function notifyEditorOfSubmission(submission: SubmissionNotification) {
  return sendEditorNotification(`New Open Margin submission: ${submission.manuscriptTitle}`, [
    "A new manuscript has been received.",
    "",
    `Reference: ${submission.id}`,
    `Title: ${submission.manuscriptTitle}`,
    `Author: ${submission.authorName}`,
    `Discipline: ${submission.discipline}`,
    `Parent or guardian confirmation: ${submission.guardianConfirmed ? "provided" : "not indicated"}`,
    "",
    "Open the private editor to review the submission and download the blinded manuscript.",
  ]);
}

export async function notifyEditorOfReviewerApplication(application: ReviewerApplicationNotification) {
  return sendEditorNotification(`New Open Margin reviewer application: ${application.fullName}`, [
    "A new reviewer or advisor application has been received.",
    "",
    `Reference: ${application.id}`,
    `Applicant: ${application.fullName}`,
    `Role: ${application.role}`,
    `Fields: ${application.disciplines}`,
    "",
    "Open the private recruitment desk to review the application.",
  ]);
}

export async function notifyEditorOfPartnerInquiry(inquiry: PartnerInquiryNotification) {
  return sendEditorNotification(`New Open Margin partner inquiry: ${inquiry.organizationName}`, [
    "A new partnership inquiry has been received.",
    "",
    `Reference: ${inquiry.id}`,
    `Organization: ${inquiry.organizationName}`,
    `Contact: ${inquiry.contactName}`,
    `Organization type: ${inquiry.organizationType}`,
    `Interested in: ${inquiry.requestedPath}`,
    "",
    "Open the private recruitment desk to review the inquiry.",
  ]);
}
