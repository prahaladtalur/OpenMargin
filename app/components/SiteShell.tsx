import Link from "next/link";
import { site } from "../site";

const nav = [
  { href: "/issue", label: "Read" },
  { href: "/review", label: "Review process" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <>
      <div className="notice">
        <p>{site.submissionWindow}</p>
        <Link href="/submit">View submission guide <span aria-hidden="true">↗</span></Link>
      </div>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label={`${site.name} home`}>
          <span className="wordmark-name">{site.name}</span>
          <span className="wordmark-rule" aria-hidden="true" />
          <span className="wordmark-descriptor">{site.descriptor}</span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
          <Link className="nav-submit" href="/submit">Submit work</Link>
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
            <Link href="/submit">Submit work</Link>
          </nav>
        </details>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-mark">
        <span className="footer-monogram">OM</span>
        <p>
          Open access.<br />
          Constructive by design.
        </p>
      </div>
      <div className="footer-column">
        <p className="eyebrow">Explore</p>
        <Link href="/issue">Pilot issue</Link>
        <Link href="/review">Review process</Link>
        <Link href="/submit">Submission guide</Link>
      </div>
      <div className="footer-column">
        <p className="eyebrow">Journal</p>
        <Link href="/about">About & masthead</Link>
        <Link href="/about#policies">Editorial policies</Link>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </div>
      <div className="footer-bottom">
        <p>© 2026 {site.name}. A student-led, unincorporated project in Washington.</p>
        <p>Authors retain copyright.</p>
      </div>
    </footer>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-intro-copy">{description}</p>
    </section>
  );
}
