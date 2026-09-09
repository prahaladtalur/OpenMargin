const languageCodes: Record<string, string> = {
  bangla: "bn",
  bengali: "bn",
  hindi: "hi",
  tamil: "ta",
  urdu: "ur",
  telugu: "te",
  marathi: "mr",
};

export function languageCode(language: string | null | undefined) {
  const key = language?.trim().toLowerCase();
  return key ? languageCodes[key] : undefined;
}
