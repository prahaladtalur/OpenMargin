import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { SiteFooter, SiteHeader } from "./components/SiteShell";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Open Margin: A Student Research Journal",
      template: "%s | Open Margin",
    },
    description:
      "A free journal for student research in the humanities, social sciences, and STEM. Authors receive detailed review and keep their copyright.",
    openGraph: {
      title: "Open Margin",
      description:
        "A free journal for student research in the humanities, social sciences, and STEM.",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Open Margin",
      description:
        "A free journal for student research in the humanities, social sciences, and STEM.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
