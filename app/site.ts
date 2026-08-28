export const site = {
  name: "Open Margin",
  descriptor: "A student research journal",
  location: "Washington, United States",
  submissionWindow: "Volume 01 submissions are open",
};

export const reviewSteps = [
  {
    number: "01",
    title: "Fit check",
    timing: "Within 7 days",
    body: "An editor checks that the paper fits our scope, is original work, and is ready for review.",
  },
  {
    number: "02",
    title: "Two written reviews",
    timing: "Weeks 2 to 5",
    body: "Two reviewers read the question, evidence, method, and writing. Each reviewer sends written comments.",
  },
  {
    number: "03",
    title: "Decision letter",
    timing: "Target: weeks 6 to 8",
    body: "An editor considers the reviews and sends a decision letter with comments and next steps. We aim to give useful feedback when we decline a paper.",
  },
  {
    number: "04",
    title: "Revision and publication",
    timing: "If accepted",
    body: "Accepted authors answer the comments. We copyedit the final file and publish it only after the author approves the final version.",
  },
];

export const focusAreas = [
  {
    field: "History",
    note: "Sources, memory, institutions, change",
  },
  {
    field: "Political science",
    note: "Power, policy, participation, public life",
  },
  {
    field: "Literature and culture",
    note: "Texts, language, interpretation, lived experience",
  },
  {
    field: "Science, technology and engineering",
    note: "Methods, data, systems, testable questions",
  },
];

export const standards = [
  "A clear question or thesis",
  "Use of credible primary or secondary sources",
  "Evidence that supports the conclusion",
  "A clear note about methods and limits",
  "Original work by a student researcher",
];

export const publicUpdates = [
  {
    period: "August 2026",
    label: "Capacity first",
    title: "We are building the reviewer bench before we widen outreach.",
    body: "Open Margin is inviting reviewers, section editors, and academic advisors. The next growth step is a small, qualified bench that can support two written reviews per eligible paper.",
    href: "/reviewers",
    link: "Review with us",
  },
  {
    period: "August 2026",
    label: "Measurement",
    title: "Referral links now measure completed submissions.",
    body: "Programs and mentors can use a labeled public link. We record only the optional campaign label with a submission. We do not track IP addresses, device IDs, or browsing history.",
    href: "/transparency",
    link: "Read the public record",
  },
  {
    period: "August 2026",
    label: "Volume 01",
    title: "The first article is available to read.",
    body: "Volume 01 is open. We add an article only after review, revision, and author approval. More papers will appear as the editorial process supports them.",
    href: "/issue",
    link: "Read Volume 01",
  },
  {
    period: "Pilot launch",
    label: "Public standards",
    title: "The review process and policies are open to everyone.",
    body: "Authors can read the scope, rubric, privacy rules, and decision paths before they submit. The same public standards apply to every author and partner.",
    href: "/review",
    link: "See the review process",
  },
] as const;
