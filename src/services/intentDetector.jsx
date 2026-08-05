import { generateReply } from "./aiService";

const ALLOWED_INTENTS = [
  "Complaint",
  "Apology",
  "Follow-up",
  "Leave Request",
  "Resignation",
  "Negotiation",
  "Thank You",
  "Customer Support",
  "Escalation",
  "Interview",
  "Invitation",
  "Request",
  "Reminder",
  "General",
];

const ALLOWED_MESSAGE_TYPES = [
  "Email",
  "WhatsApp",
  "LinkedIn",
  "SMS",
  "Social Media",
  "Work Chat",
  "General Message",
];

const ALLOWED_TONES = [
  "Professional",
  "Friendly",
  "Funny",
  "Polite",
  "Confident",
  "Empathetic",
  "Direct",
  "Casual",
  "Formal",
];

const ALLOWED_PERSONAS = [
  "Professional",
  "Manager",
  "Customer Support",
  "Friend",
  "Colleague",
  "Business Owner",
  "Job Applicant",
  "Team Member",
];

function cleanJsonResponse(response) {
  return response
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function findAllowedValue(value, allowedValues, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  const match = allowedValues.find(
    (item) => item.toLowerCase() === normalizedValue
  );

  return match || fallback;
}

function normalizeConfidence(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(Math.round(number), 100));
}

function normalizeDetection(result) {
  return {
    intent: findAllowedValue(
      result?.intent,
      ALLOWED_INTENTS,
      "General"
    ),

    messageType: findAllowedValue(
      result?.messageType,
      ALLOWED_MESSAGE_TYPES,
      "General Message"
    ),

    suggestedTone: findAllowedValue(
      result?.suggestedTone,
      ALLOWED_TONES,
      "Professional"
    ),

    suggestedPersona: findAllowedValue(
      result?.suggestedPersona,
      ALLOWED_PERSONAS,
      "Professional"
    ),

    detectedLanguage:
      typeof result?.detectedLanguage === "string" &&
      result.detectedLanguage.trim()
        ? result.detectedLanguage.trim()
        : "English",

    confidence: normalizeConfidence(result?.confidence),

    summary:
      typeof result?.summary === "string"
        ? result.summary.trim()
        : "",

    reason:
      typeof result?.reason === "string"
        ? result.reason.trim()
        : "",
  };
}

export async function detectMessageIntent(
  message,
  { signal } = {}
) {
  const cleanMessage =
    typeof message === "string" ? message.trim() : "";

  if (!cleanMessage) {
    throw new Error(
      "A message is required for intent detection."
    );
  }

  const prompt = `You are ReplyForge's message classification engine.

Analyze the incoming message and return ONLY valid JSON.

Do not use markdown.
Do not add explanations outside the JSON.

Choose only from these allowed values:

INTENT:
${ALLOWED_INTENTS.join(", ")}

MESSAGE TYPE:
${ALLOWED_MESSAGE_TYPES.join(", ")}

SUGGESTED TONE:
${ALLOWED_TONES.join(", ")}

SUGGESTED PERSONA:
${ALLOWED_PERSONAS.join(", ")}

Return exactly this JSON structure:

{
  "intent": "General",
  "messageType": "General Message",
  "suggestedTone": "Professional",
  "suggestedPersona": "Professional",
  "detectedLanguage": "English",
  "confidence": 0,
  "summary": "",
  "reason": ""
}

Rules:
- confidence must be a whole number from 0 to 100.
- summary must be one short sentence.
- reason must be one short sentence.
- Detect the real purpose of the sender, not only keywords.
- Do not invent missing information.
- When uncertain, choose General.
- Return only JSON.

Incoming message:
${cleanMessage}`;

  const response = await generateReply(
    prompt,
    "Professional",
    "Short",
    "English",
    "Professional",
    { signal }
  );

  if (!response?.trim()) {
    throw new Error(
      "Intent detection returned an empty response."
    );
  }

  try {
    const parsedResult = JSON.parse(
      cleanJsonResponse(response)
    );

    return normalizeDetection(parsedResult);
  } catch (error) {
    console.error(
      "Intent detection JSON parsing error:",
      error,
      response
    );

    throw new Error(
      "The AI returned an invalid intent detection result."
    );
  }
}

export {
  ALLOWED_INTENTS,
  ALLOWED_MESSAGE_TYPES,
  ALLOWED_TONES,
  ALLOWED_PERSONAS,
};