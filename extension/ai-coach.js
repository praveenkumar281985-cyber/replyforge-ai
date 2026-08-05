(function initializeReplyForgeAICoach() {
  const METRIC_KEYS = [
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
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(100, Math.round(number)));
  }

  function cleanJsonResponse(value) {
    return String(value || "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
  }

  function normalizeAnalysis(result) {
    const normalized = {};

    METRIC_KEYS.forEach((key) => {
      normalized[key] = clampScore(result?.[key]);
    });

    normalized.verdict =
      typeof result?.verdict === "string"
        ? result.verdict.trim().slice(0, 240)
        : "";

    normalized.suggestions = Array.isArray(result?.suggestions)
      ? result.suggestions
          .filter((item) => typeof item === "string" && item.trim())
          .map((item) => item.trim())
          .slice(0, 5)
      : [];

    if (!normalized.verdict) {
      normalized.verdict =
        normalized.overall >= 85
          ? "This reply is clear, professional and ready to send."
          : normalized.overall >= 70
            ? "This is a strong reply with a few possible improvements."
            : "This reply would benefit from refinement before sending.";
    }

    if (!normalized.suggestions.length) {
      normalized.suggestions = [
        "Review the opening and closing for clarity.",
        "Keep the tone aligned with the recipient.",
        "Remove any unnecessary wording.",
      ];
    }

    return normalized;
  }

  function buildAnalysisPrompt(reply) {
    const cleanReply =
      typeof reply === "string" ? reply.trim() : "";

    if (!cleanReply) {
      throw new Error("A reply is required for AI Coach analysis.");
    }

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

Rules:
- Every score must be a whole number from 0 to 100.
- aggressiveRisk: 0 means calm and safe; 100 means highly aggressive or offensive.
- misunderstandingRisk: 0 means very clear; 100 means highly confusing.
- verdict must be one short sentence.
- suggestions must be practical and non-repetitive.
- Do not invent missing context.

Reply to analyze:
${cleanReply}`;
  }

  function parseAnalysisResponse(response) {
    const cleanResponse = cleanJsonResponse(response);

    if (!cleanResponse) {
      throw new Error("AI Coach returned an empty response.");
    }

    try {
      return normalizeAnalysis(JSON.parse(cleanResponse));
    } catch (error) {
      console.error("ReplyForge AI Coach JSON error:", error, response);
      throw new Error("AI Coach returned an invalid analysis result.");
    }
  }

  globalThis.ReplyForgeAICoach = {
    buildAnalysisPrompt,
    parseAnalysisResponse,
    normalizeAnalysis,
  };
})();
