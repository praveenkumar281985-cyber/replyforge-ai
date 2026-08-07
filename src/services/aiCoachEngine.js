import { generateReply } from "./aiService";

const SCORE_KEYS = [
  "overall",
  "grammar",
  "clarity",
  "professionalism",
  "politeness",
  "confidence",
  "empathy",
  "readability",
  "aggressiveRisk",
  "misunderstandingRisk",
  "callToAction",
];

function clampScore(value) {
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

function extractJsonObject(text) {
  const cleanText = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace =
    cleanText.indexOf("{");

  const lastBrace =
    cleanText.lastIndexOf("}");

  if (
    firstBrace === -1 ||
    lastBrace === -1 ||
    lastBrace <= firstBrace
  ) {
    throw new Error(
      "AI Coach returned an invalid response."
    );
  }

  return cleanText.slice(
    firstBrace,
    lastBrace + 1
  );
}

function normalizeSuggestions(
  suggestions
) {
  const normalized =
    Array.isArray(suggestions)
      ? suggestions
          .map((item) =>
            String(item || "").trim()
          )
          .filter(Boolean)
      : [];

  const fallback = [
    "Keep the reply clear and focused.",
    "Use a professional and natural tone.",
    "Make the next step easy to understand.",
  ];

  return [
    ...normalized,
    ...fallback,
  ].slice(0, 3);
}

function normalizeCoachResult(
  payload
) {
  const result = {
    verdict:
      String(
        payload?.verdict ||
          "Reply analysis completed."
      ).trim(),
    suggestions:
      normalizeSuggestions(
        payload?.suggestions
      ),
  };

  for (const key of SCORE_KEYS) {
    result[key] =
      clampScore(payload?.[key]);
  }

  return result;
}

function buildCoachPrompt(reply) {
  return `You are ReplyForge AI Coach.

Analyze the reply below and return ONLY valid JSON.
Do not use markdown code blocks.
Do not add explanations before or after the JSON.

Use exactly this structure:

{
  "overall": 0,
  "grammar": 0,
  "clarity": 0,
  "professionalism": 0,
  "politeness": 0,
  "confidence": 0,
  "empathy": 0,
  "readability": 0,
  "aggressiveRisk": 0,
  "misunderstandingRisk": 0,
  "callToAction": 0,
  "verdict": "",
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ]
}

Scoring rules:
- Every score must be a whole number from 0 to 100.
- aggressiveRisk: 0 means completely safe and calm; 100 means highly aggressive or offensive.
- misunderstandingRisk: 0 means extremely clear; 100 means highly confusing or easy to misinterpret.
- callToAction: score how clear and useful the next step is. If no call to action is needed, score based on whether the reply ends appropriately.
- verdict must be one short sentence.
- suggestions must be specific, practical, and non-repetitive.

Reply to analyze:
${reply}`;
}

export async function analyzeReplyWithCoach({
  reply,
  signal,
}) {
  const cleanReply =
    String(reply || "").trim();

  if (!cleanReply) {
    throw new Error(
      "Please generate a reply first."
    );
  }

  const result =
    await generateReply(
      buildCoachPrompt(cleanReply),
      "Professional",
      "Medium",
      "English",
      "Professional",
      { signal }
    );

  if (!result?.trim()) {
    throw new Error(
      "No analysis was generated."
    );
  }

  let parsed;

  try {
    parsed = JSON.parse(
      extractJsonObject(result)
    );
  } catch (error) {
    if (
      error instanceof SyntaxError
    ) {
      throw new Error(
        "AI Coach returned invalid JSON. Please try again."
      );
    }

    throw error;
  }

  return normalizeCoachResult(
    parsed
  );
}

export async function improveReplyWithCoach({
  reply,
  suggestions,
  signal,
}) {
  const cleanReply = String(reply || "").trim();

  if (!cleanReply) {
    throw new Error("Please generate a reply first.");
  }

  const feedback = Array.isArray(suggestions)
    ? suggestions.filter(Boolean).slice(0, 5).join("\n- ")
    : "Improve clarity, tone and professionalism.";

  const result = await generateReply(
    `Improve the reply below using this AI Coach feedback:\n- ${feedback}\n\nReturn only the improved reply. Do not add headings, notes or quotation marks.\n\nReply:\n${cleanReply}`,
    "Professional",
    "Medium",
    "English",
    "Professional",
    { signal }
  );

  if (!result?.trim()) {
    throw new Error("No improved reply was generated.");
  }

  return result.trim();
}
