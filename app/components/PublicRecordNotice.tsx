import Link from "next/link";

export function PublicRecordNotice() {
  return (
    <aside className="public-record-notice" aria-label="Public record audit notice">
      <div>
        <p className="eyebrow">Public record audit</p>
        <p>
          Volume 01&apos;s public entries are unreviewed pilot records. We are
          checking them against review, final-edit, author-approval, and
          readable-file evidence. Do not treat them as completed publications.
        </p>
      </div>
      <Link href="/transparency#public-record-audit">Read the audit note <span aria-hidden="true">↗</span></Link>
    </aside>
  );
}
