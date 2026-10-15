type ReviewRecord = {
  status: string;
  manuscriptVersionId?: string | null;
  reviewerName: string;
  reviewerEmail: string;
  reviewerApplicationId?: string | null;
  conflictConfirmed: boolean;
  confidentialityConfirmed: boolean;
  questionScore: number | null;
  contextScore: number | null;
  methodScore: number | null;
  evidenceScore: number | null;
  clarityScore: number | null;
  integrityScore: number | null;
  recommendation: string | null;
  comments: string | null;
};

const recommendations = new Set(["strong-revise", "revise", "accept-with-changes", "accept", "decline"]);
const normalize = (value: string) => value.trim().toLowerCase();

export function reviewerMatchesAuthor(
  reviewer: { name: string; email: string },
  author: { authorName: string; authorEmail: string },
) {
  return normalize(reviewer.email) === normalize(author.authorEmail)
    || normalize(reviewer.name) === normalize(author.authorName);
}

// Editors still check subject fit and conflicts. This rejects incomplete reports
// and obvious self-review; it does not independently verify a reviewer's claims.
export function hasRequiredIndependentReview(
  reviews: ReviewRecord[],
  author: { authorName: string; authorEmail: string },
  activeReviewerIds?: ReadonlySet<string>,
  expectedManuscriptVersionId?: string,
) {
  return reviews.some((review) => {
    const scores = [review.questionScore, review.contextScore, review.methodScore,
      review.evidenceScore, review.clarityScore, review.integrityScore];
    return review.status === "submitted"
      && Boolean(expectedManuscriptVersionId && review.manuscriptVersionId === expectedManuscriptVersionId)
      && (!activeReviewerIds || Boolean(review.reviewerApplicationId && activeReviewerIds.has(review.reviewerApplicationId)))
      && review.conflictConfirmed && review.confidentialityConfirmed
      && review.reviewerName.trim().length > 0
      && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(review.reviewerEmail.trim())
      && !reviewerMatchesAuthor({ name: review.reviewerName, email: review.reviewerEmail }, author)
      && scores.every((score) => score !== null && Number.isInteger(score) && score >= 1 && score <= 5)
      && recommendations.has(review.recommendation ?? "")
      && (review.comments?.trim().length ?? 0) >= 80;
  });
}
