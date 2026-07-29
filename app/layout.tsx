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
      default: "Open Margin: A Journal of Emerging Scholarship",
      template: "%s | Open Margin",
    },
    description:
      "A free, open-access journal offering rigorous, constructive review for secondary-school scholarship across the humanities, social sciences, and STEM.",
    openGraph: {
      title: "Open Margin",
      description:
        "Serious work deserves serious attention. A free journal of emerging scholarship.",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Open Margin",
      description:
        "Serious work deserves serious attention. A free journal of emerging scholarship.",
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
