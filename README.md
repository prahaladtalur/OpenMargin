# Open Margin

A maintainable website repository for Open Margin, a free journal for research
by authors of any age across the humanities, social sciences, and STEM.

## What is included

- Editorial homepage
- Pilot issue and article-list presentation
- Transparent review process and rubric
- Private submission status and notification workflow
- Private editor desk with decision letters, publication approval, and review records
- Public publication record, article citations, sitemap, and robots policy
- Search-friendly publishing guide with FAQ data and campaign-ready referral links
- Submission guide and manuscript checklist
- About, masthead, and policy index
- Responsive navigation and accessible page structure
- Private marketing desk with privacy-light campaign attribution
- Cloudflare/Sites-compatible production build

## Edit the journal

The review steps, focus areas, and editorial standards are centralized in
`app/site.ts`. Publication records are stored in D1 and rendered on the
homepage, issue page, public record page, and article routes.

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

## Current operating checklist

1. Keep at least two qualified reviewers and one backup available for the current fields.
2. Process each eligible manuscript through two review records, an editor decision, and a decision note.
3. Publish only the final version approved by the author or guardian when required.
4. Keep the public record, policies, and article metadata accurate after every publication.
5. Publish four more articles before applying for an online ISSN for the first complete issue.
6. Use `docs/marketing-sprint.md` for one month of permission-based outreach and record tagged submissions in `/editor/marketing`.
7. Use `docs/30-day-growth-plan.md` for the strategic capacity and trust targets behind the sprint.

## Repository structure

```text
app/
  about/       About, masthead, and policies
  components/  Shared header, footer, and page introduction
  editor/      Private submission, review, decision, publication, and marketing desk
  issue/       Pilot issue
  review/      Review workflow and rubric
  submit/      Submission guide
  transparency/ Public publication record
  site.ts      Editable journal content and settings
docs/
  marketing-sprint.md     30-day marketing calendar and measures
  marketing-copy-pack.md  Reusable, permission-based outreach copy
```

## License

Site code may be adapted for the journal. Publication content and author
manuscripts should use their own explicit copyright and licensing terms.
