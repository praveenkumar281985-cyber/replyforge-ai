import { detectMessageIntent } from "./intentDetector";

const TONE_MAP = {
  Professional: "Professional",
  Friendly: "Friendly",
  Funny: "Funny",
  Casual: "Casual",
  Formal: "Formal",
  Polite: "Professional",
  Confident: "Professional",
  Empathetic: "Friendly",
  Direct: "Professional",
};

const PERSONA_MAP = {
  Professional: "Professional",
  Manager: "HR Manager",
  "Customer Support": "Customer Support",
  Friend: "Friendly",
  Colleague: "Professional",
  "Business Owner": "CEO",
  "Job Applicant": "Professional",
  "Team Member": "Professional",
};

const LANGUAGE_MAP = {
  English: "English",
  Hindi: "Hindi",
  Spanish: "Spanish",
  French: "French",
  German: "German",
};

function clampConfidence(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(number)
    )
  );
}

function normalizeIntentResult(result) {
  return {
    ...result,
    intent:
      String(
        result?.intent ||
          "General reply"
      ).trim(),
    messageType:
      String(
        result?.messageType ||
          "General message"
      ).trim(),
    summary:
      String(
        result?.summary ||
          "Message analyzed successfully."
      ).trim(),
    suggestedTone:
      String(
        result?.suggestedTone ||
          "Professional"
      ).trim(),
    suggestedPersona:
      String(
        result?.suggestedPersona ||
          "Professional"
      ).trim(),
    detectedLanguage:
      String(
        result?.detectedLanguage ||
          "English"
      ).trim(),
    confidence:
      clampConfidence(
        result?.confidence
      ),
  };
}

export async function analyzeIntent({
  message,
}) {
  const cleanMessage =
    String(message || "").trim();

  if (!cleanMessage) {
    throw new Error(
      "Please enter or upload a message first."
    );
  }

  const rawResult =
    await detectMessageIntent(
      cleanMessage
    );

  const result =
    normalizeIntentResult(
      rawResult
    );

  return {
    result,
    mappedTone:
      TONE_MAP[
        result.suggestedTone
      ] || "Professional",
    mappedPersona:
      PERSONA_MAP[
        result.suggestedPersona
      ] || "Professional",
    mappedLanguage:
      LANGUAGE_MAP[
        result.detectedLanguage
      ] || null,
  };
}
