# Open Margin

A maintainable website repository for a free, student-led journal of emerging
scholarship in the humanities and social sciences.

> **Working title:** “Open Margin” is a placeholder brand until the founding
> team confirms the journal name and domain.

## What is included

- Editorial homepage
- Pilot issue and article-list presentation
- Transparent review process and rubric
- Submission guide and manuscript checklist
- About, masthead, and policy index
- Responsive navigation and accessible page structure
- Cloudflare/Sites-compatible production build

## Edit the journal

The journal name, contact address, submission window, review steps, sample
papers, and editorial standards are centralized in `app/site.ts`.

The sample paper titles are clearly labeled as illustrative. Replace them with
real accepted work before publishing the pilot issue.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`.

## Check a production build

```bash
npm test
```

## Before public launch

1. Confirm the final journal name and domain.
2. Replace the placeholder contact email in `app/site.ts`.
3. Confirm the editorial team and academic advisors.
4. Finish and review the policies listed on the About page.
5. Connect a submission form with a guardian-consent and privacy workflow.
6. Replace the illustrative pilot-issue titles with accepted work.

## Repository structure

```text
app/
  about/       About, masthead, and policies
  components/  Shared header, footer, and page introduction
  issue/       Pilot issue
  review/      Review workflow and rubric
  submit/      Submission guide
  site.ts      Editable journal content and settings
```

## License

Site code may be adapted for the journal. Publication content and author
manuscripts should use their own explicit copyright and licensing terms.
