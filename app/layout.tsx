import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { CampaignAttribution } from "./components/CampaignAttribution";
import { SiteFooter, SiteHeader } from "./components/SiteShell";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");
  const origin = isLocal ? `http://${host}` : "https://openmargin.org";

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Open Margin: A student research journal",
      template: "%s | Open Margin",
    },
    description:
      "A free journal for research by authors of any age in the humanities, social sciences, and STEM. Authors keep their copyright and receive a written decision.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Open Margin",
      description:
        "A free journal for research by authors of any age in the humanities, social sciences, and STEM.",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Open Margin",
      description:
        "A free journal for research by authors of any age in the humanities, social sciences, and STEM.",
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
        <CampaignAttribution />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
