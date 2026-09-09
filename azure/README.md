# Open Margin Azure sidecar

Open Margin already has a private submission and review workflow backed by
Cloudflare D1/R2. This adapter exports only public aggregate metrics to the
Azure Advantage Kit:

```sh
npm run azure:export-public-metrics
```

Optional environment variables:

- `OPEN_MARGIN_PUBLIC_METRICS_URL`, defaults to
  `https://openmargin.org/api/public-metrics`.
- `AZURE_PUBLIC_METRICS_ENDPOINT`, the Azure Function
  `/api/research-results` endpoint.
- `AZURE_FUNCTION_KEY`, kept in the shell or secret store, never in the site.

The endpoint intentionally omits author names, email addresses, manuscript
files, titles, reviewer identities, decisions, and private submission counts.
Do not turn this into a manuscript-processing or automated editorial-decision
system.
