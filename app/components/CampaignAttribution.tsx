"use client";

import { useEffect } from "react";
import { campaignFromSearchParams } from "../../lib/campaign";

export const campaignStorageKey = "openmargin-campaign";

export function CampaignAttribution() {
  useEffect(() => {
    const campaign = campaignFromSearchParams(Object.fromEntries(new URLSearchParams(window.location.search)), window.location.pathname);

    if (!campaign.source && !campaign.medium && !campaign.name) return;

    try {
      window.sessionStorage.setItem(campaignStorageKey, JSON.stringify(campaign));
    } catch {
      // The submission form can still use labels from a direct URL.
    }
  }, []);

  return null;
}
