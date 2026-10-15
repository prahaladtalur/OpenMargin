# Open Margin release checklist

Use this checklist before each public release. Keep secrets in the Sites environment, not in the repository.

## Runtime settings

- [ ] `EDITOR_PASSWORD` is set
- [ ] `EDITOR_SESSION_SECRET` is set and is not reused elsewhere
- [ ] `RESEND_API_KEY` is set if email alerts are required
- [ ] `RESEND_FROM` uses a verified sender domain when available
- [ ] `NOTIFICATION_EMAIL` is the correct editorial inbox
- [ ] D1 binding is `DB`
- [ ] R2 binding is `MANUSCRIPTS`

## Editorial checks

- [ ] The public policies match the current process
- [ ] One qualified independent reviewer and a backup are available for the fields shown as open
- [ ] Each accepted manuscript has one complete private independent review record
- [ ] Conflict and confidentiality checks are recorded
- [ ] Decision notes are specific and respectful
- [ ] The author's age status and its source are recorded privately
- [ ] The author approved the exact public text; record the source and date
- [ ] If the author is under 18, the guardian approved that exact public text
- [ ] The private release record is linked to the hash of the exact public version

## Public checks

- [ ] `/submit`, `/review`, `/policies`, `/issue`, `/transparency`, and `/status` load
- [ ] `/editor` redirects unauthenticated visitors to sign in
- [ ] `/api/` and `/editor` are excluded from search crawling
- [ ] New articles have a stable citation, canonical URL, and issue link
- [ ] The homepage count matches the issue page and public record
- [ ] No private manuscript, reviewer, guardian, or decision data is public

## After release

- [ ] Open the live homepage and one article page
- [ ] Confirm the latest deployment version and commit in the Sites dashboard
- [ ] Check the notification inbox for a test alert only when a safe test record exists
- [ ] Record the release date and any policy change in the private operations log
