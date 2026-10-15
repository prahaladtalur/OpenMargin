export function isReviewerEligibleForManuscriptAccess(reviewer) {
  if (!reviewer || reviewer.status !== "active") return false;
  const isMinor = reviewer.ageBand === "minor" || reviewer.ageBand === "14-17" || reviewer.ageBand === "under-18";
  return !isMinor || Boolean(reviewer.guardianApprovalAt && reviewer.guardianApprovalEvidence);
}
