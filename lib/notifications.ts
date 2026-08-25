import { env } from "cloudflare:workers";

type SubmissionNotification = {
  id: string;
  authorName: string;
  authorEmail: string;
  manuscriptTitle: string;
  discipline: string;
  guardianConfirmed: boolean;
};

type AuthorDecisionNotification = {
  id: string;
  authorName: string;
  authorEmail: string;
  manuscriptTitle: string;
  editorMessage?: string | null;
};

export type EditorialDecisionStatus = "revise" | "declined" | "accepted" | "published";

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

async function sendEmail(to: string, subject: string, lines: string[]) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM || !to) {
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
      to: [to],
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

async function sendEditorNotification(subject: string, lines: string[]) {
  if (!env.NOTIFICATION_EMAIL) {
    return { sent: false, reason: "The editorial notification address is not configured." };
  }
  return sendEmail(env.NOTIFICATION_EMAIL, subject, lines);
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

export async function notifyAuthorOfDecision(submission: AuthorDecisionNotification, status: EditorialDecisionStatus, publicationPath?: string) {
  const messages: Record<EditorialDecisionStatus, { subject: string; lines: string[] }> = {
    revise: {
      subject: `Open Margin decision: revision requested for ${submission.manuscriptTitle}`,
      lines: [
        `Dear ${submission.authorName},`,
        "",
        "An editor reviewed your Open Margin submission.",
        `Title: ${submission.manuscriptTitle}`,
        `Reference: ${submission.id}`,
        "Decision: Revise and resubmit.",
        "",
        "Please check your editorial message for the requested changes and next steps.",
        "A revision does not guarantee publication.",
        "",
        "Open Margin",
        "https://openmargin.org/status",
      ],
    },
    declined: {
      subject: `Open Margin decision for ${submission.manuscriptTitle}`,
      lines: [
        `Dear ${submission.authorName},`,
        "",
        "An editor reviewed your Open Margin submission.",
        `Title: ${submission.manuscriptTitle}`,
        `Reference: ${submission.id}`,
        "Decision: Declined.",
        "",
        "Please check your editorial message for the decision details and comments.",
        "",
        "Open Margin",
        "https://openmargin.org/status",
      ],
    },
    accepted: {
      subject: `Open Margin decision: accepted for ${submission.manuscriptTitle}`,
      lines: [
        `Dear ${submission.authorName},`,
        "",
        "An editor reviewed your Open Margin submission.",
        `Title: ${submission.manuscriptTitle}`,
        `Reference: ${submission.id}`,
        "Decision: Accepted for publication.",
        "",
        "The editor will contact you about final revisions, copyediting, and author approval.",
        "Acceptance does not mean that the paper is published yet.",
        "",
        "Open Margin",
        "https://openmargin.org/status",
      ],
    },
    published: {
      subject: `Your Open Margin paper is published: ${submission.manuscriptTitle}`,
      lines: [
        `Dear ${submission.authorName},`,
        "",
        "Your paper is now marked as published by Open Margin.",
        `Title: ${submission.manuscriptTitle}`,
        `Reference: ${submission.id}`,
        "",
        "Thank you for sharing your work with Open Margin.",
        "",
        "Open Margin",
        publicationPath ? `https://openmargin.org${publicationPath}` : "https://openmargin.org/issue",
      ],
    },
  };

  const message = messages[status];
  const editorMessage = submission.editorMessage?.trim();
  if (editorMessage && status !== "published") {
    message.lines.splice(message.lines.length - 2, 0, "", "Editor's message:", editorMessage);
  }
  return sendEmail(submission.authorEmail, message.subject, message.lines);
}

export async function notifyEditorOfPublication(submission: AuthorDecisionNotification, publicationPath?: string) {
  return sendEditorNotification(`Open Margin paper published: ${submission.manuscriptTitle}`, [
    "An editor marked a manuscript as published.",
    "",
    `Reference: ${submission.id}`,
    `Title: ${submission.manuscriptTitle}`,
    `Author: ${submission.authorName}`,
    `Author email: ${submission.authorEmail}`,
    "",
    publicationPath ? `Public article: https://openmargin.org${publicationPath}` : "The public article path was not provided.",
    "The author publication notice was also sent.",
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
