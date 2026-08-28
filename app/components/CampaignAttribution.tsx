"use client";

import { useEffect } from "react";

export const campaignStorageKey = "openmargin-campaign";

export function CampaignAttribution() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const campaign = {
      source: params.get("utm_source")?.slice(0, 80) ?? "",
      medium: params.get("utm_medium")?.slice(0, 80) ?? "",
      name: params.get("utm_campaign")?.slice(0, 120) ?? "",
      path: window.location.pathname.slice(0, 160),
    };

    if (!campaign.source && !campaign.medium && !campaign.name) return;

    try {
      window.sessionStorage.setItem(campaignStorageKey, JSON.stringify(campaign));
    } catch {
      // The submission form can still use labels from a direct URL.
    }
  }, []);

  return null;
}
