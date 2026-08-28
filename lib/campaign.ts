export type Campaign = {
  source: string;
  medium: string;
  name: string;
  path: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function campaignFromSearchParams(params: SearchParams, path = "/submit"): Campaign {
  return {
    source: firstValue(params.utm_source)?.slice(0, 80) ?? "",
    medium: firstValue(params.utm_medium)?.slice(0, 80) ?? "",
    name: firstValue(params.utm_campaign)?.slice(0, 120) ?? "",
    path: path.slice(0, 160),
  };
}

export function campaignQuery(campaign: Campaign) {
  const params = new URLSearchParams();
  if (campaign.source) params.set("utm_source", campaign.source);
  if (campaign.medium) params.set("utm_medium", campaign.medium);
  if (campaign.name) params.set("utm_campaign", campaign.name);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function withCampaign(href: string, campaign: Campaign) {
  return `${href}${campaignQuery(campaign)}`;
}
