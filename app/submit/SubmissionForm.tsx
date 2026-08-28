"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { campaignStorageKey } from "../components/CampaignAttribution";

const disciplines = [
  "History",
  "Literature",
  "Philosophy",
  "Economics",
  "Political science",
  "Sociology",
  "Anthropology",
  "Biology and life sciences",
  "Chemistry",
  "Physics and astronomy",
  "Earth and environmental science",
  "Mathematics and statistics",
  "Computer science",
  "Engineering and design",
  "Other humanities or social science",
  "Other STEM field",
];

type Campaign = { source: string; medium: string; name: string; path: string };

function readCampaign(): Campaign {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = {
    source: params.get("utm_source")?.slice(0, 80) ?? "",
    medium: params.get("utm_medium")?.slice(0, 80) ?? "",
    name: params.get("utm_campaign")?.slice(0, 120) ?? "",
    path: window.location.pathname.slice(0, 160),
  };
  const hasCampaignInUrl = Boolean(fromUrl.source || fromUrl.medium || fromUrl.name);

  try {
    if (hasCampaignInUrl) {
      window.sessionStorage.setItem(campaignStorageKey, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const stored = window.sessionStorage.getItem(campaignStorageKey);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Campaign>;
      return {
        source: typeof parsed.source === "string" ? parsed.source.slice(0, 80) : "",
        medium: typeof parsed.medium === "string" ? parsed.medium.slice(0, 80) : "",
        name: typeof parsed.name === "string" ? parsed.name.slice(0, 120) : "",
        path: typeof parsed.path === "string" && parsed.path.startsWith("/") ? parsed.path.slice(0, 160) : "/submit",
      };
    }
  } catch {
    return fromUrl;
  }

  return fromUrl;
}

export function SubmissionForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [requiresGuardian, setRequiresGuardian] = useState(false);
  const [campaign, setCampaign] = useState<Campaign>({ source: "", medium: "", name: "", path: "/submit" });

  useEffect(() => {
    setCampaign(readCampaign());
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const response = await fetch("/api/submissions", { method: "POST", body: new FormData(event.currentTarget) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "We could not receive the submission. Try again.");
      return;
    }
    setStatus("success");
    setMessage(`Received. Reference code: ${payload.reference}. Save this code.`);
    event.currentTarget.reset();
    setRequiresGuardian(false);
  }

  if (status === "success") {
    return <section className="submission-success" aria-live="polite"><p className="handwritten">submission received</p><h2>We have your work.</h2><p>{message}</p><p>An editor will contact you after the first read. This is usually within seven days.</p><div className="success-actions"><Link className="button button-dark" href="/status">Check submission status</Link><button className="button button-paper" onClick={() => { setStatus("idle"); setMessage(""); }}>Start another submission</button></div></section>;
  }

  return (
    <form className="submission-form" onSubmit={submit} encType="multipart/form-data">
      <div className="honeypot" aria-hidden="true"><label>Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <input type="hidden" name="campaignSource" value={campaign.source} />
      <input type="hidden" name="campaignMedium" value={campaign.medium} />
      <input type="hidden" name="campaignName" value={campaign.name} />
      <input type="hidden" name="landingPath" value={campaign.path} />
      <fieldset>
        <legend><span>01</span> Your details</legend>
        <div className="form-grid">
          <label>Full name<input name="authorName" required autoComplete="name" maxLength={120} /></label>
          <label>Contact email<input name="authorEmail" type="email" required autoComplete="email" maxLength={254} /></label>
          <label>School or organization <small>(optional)</small><input name="schoolOrOrganization" maxLength={160} /></label>
          <label>Country or region <small>(optional)</small><input name="countryOrRegion" maxLength={100} /></label>
          <label className="wide"><input name="guardianConfirmed" type="checkbox" onChange={(event) => setRequiresGuardian(event.target.checked)} /> The author is under 18. A parent or guardian approved this submission. For authors under 13, a parent or guardian must complete this form with their own email.</label>
          {requiresGuardian && <label className="wide">Parent or guardian email<input name="guardianEmail" type="email" required autoComplete="email" maxLength={254} /></label>}
        </div>
      </fieldset>

      <fieldset>
        <legend><span>02</span> Your work</legend>
        <div className="form-grid">
          <label className="wide">Manuscript title<input name="manuscriptTitle" required maxLength={240} /></label>
          <label>Primary discipline<select name="discipline" required defaultValue=""><option value="" disabled>Select one</option>{disciplines.map((discipline) => <option key={discipline}>{discipline}</option>)}</select></label>
          <label>Approximate word count<input name="wordCount" type="number" min="2500" max="8000" required /></label>
          <label className="wide">Abstract <small>(300 to 1,800 characters)</small><textarea name="abstract" required minLength={300} maxLength={1800} rows={7} /></label>
          <label className="wide">Work origin<textarea name="originNote" required maxLength={1000} rows={4} placeholder="For example: classwork, science fair, lab, design project, independent study, or mentored research." /></label>
          <label className="wide">AI assistance used<input name="aiDisclosure" required maxLength={1000} placeholder={'Write "No material AI use" or list each tool and its use.'} /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>03</span> Upload</legend>
        <label className="file-field">Blinded paper or report <small>PDF or DOCX, up to 10 MB. Remove your name, school, and acknowledgments.</small><input name="manuscript" type="file" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx" required /></label>
        <div className="declarations">
          <label><input type="checkbox" name="originalWorkConfirmed" required /> I confirm this is original work. I cited all sources. Every listed author approves the submission.</label>
          <label><input type="checkbox" name="privacyConfirmed" required /> I read the <Link href="/policies#privacy">privacy and guardian-contact policy</Link>. I consent to editorial use of this information and manuscript.</label>
        </div>
      </fieldset>
      {status === "error" && <p className="form-error" role="alert">{message}</p>}
      <div className="form-submit"><p>Free to submit. Editors read each submission before deciding whether to review it.</p><button className="button button-dark" disabled={status === "sending"}>{status === "sending" ? "Sending" : "Submit work"}</button></div>
    </form>
  );
}
