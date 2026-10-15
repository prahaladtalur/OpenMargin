"use client";

export function ArticleReadingActions() {
  return (
    <div className="article-reading-actions">
      <p className="eyebrow">Readable copy</p>
      <p>Use this formatted page to read the public record. You can print it or save it as a PDF from your browser.</p>
      <button className="button button-paper" type="button" onClick={() => window.print()}>Print or save as PDF</button>
    </div>
  );
}
