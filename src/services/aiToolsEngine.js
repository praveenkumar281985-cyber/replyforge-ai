import { generateReply } from "./aiService";

const REWRITE_INSTRUCTIONS = {
  Professional:
    "Rewrite this reply in a polished and professional tone.",
  Friendly:
    "Rewrite this reply in a warm, natural and friendly tone.",
  Funny:
    "Rewrite this reply in a light and funny tone without being offensive.",
  Shorter:
    "Make this reply shorter and more concise while preserving its meaning.",
  Longer:
    "Make this reply longer with useful details while keeping it clear.",
  "More Polite":
    "Rewrite this reply to sound more polite, respectful and considerate.",
  Business:
    "Rewrite this reply in a formal business communication style.",
  Stronger:
    "Rewrite this reply to sound confident, firm and persuasive without being rude.",
};

const TOOL_INSTRUCTIONS = {
  grammar:
    "Fix all grammar, spelling and punctuation errors. Preserve the original meaning and tone.",
  humanize:
    "Rewrite this so it sounds natural, warm and genuinely human. Avoid robotic or overly formal wording.",
  shorten:
    "Make this reply shorter and more concise while keeping every important point.",
  expand:
    "Expand this reply with useful detail while keeping it clear and professional.",
  followup:
    "Create a natural follow-up reply based on this message.",
  email:
    "Format this reply as a polished email with an appropriate greeting, body and sign-off.",
  approve:
    "Rewrite this as a clear approval reply. Confirm the decision, keep it positive and state the next step when useful.",
  reject:
    "Rewrite this as a respectful rejection or decline. Be clear, firm and professional without sounding cold.",
  escalate:
    "Rewrite this as a professional escalation. State the issue, urgency, impact and the action needed without sounding aggressive.",
  reminder:
    "Rewrite this as a polite reminder that clearly asks for an update or action.",
  delay:
    "Rewrite this to politely communicate a delay, set realistic expectations and reassure the recipient about the next update.",
  apology:
    "Rewrite this as a sincere professional apology. Acknowledge the inconvenience, take responsibility where appropriate and state the resolution or next step.",
};

function requireReply(reply) {
  const cleanReply = reply?.trim();

  if (!cleanReply) {
    throw new Error(
      "Please generate a reply first."
    );
  }

  return cleanReply;
}

function requireGeneratedText(
  result,
  fallbackMessage
) {
  const cleanResult =
    result?.trim();

  if (!cleanResult) {
    throw new Error(
      fallbackMessage
    );
  }

  return cleanResult;
}

export async function rewriteReply({
  reply,
  mode,
  length,
  language,
  persona,
  signal,
}) {
  const cleanReply =
    requireReply(reply);

  const instruction =
    REWRITE_INSTRUCTIONS[mode] ||
    "Rewrite this reply in a clearer and better way.";

  const prompt = `${instruction}

Return only the rewritten reply.
Do not include headings, explanations, notes or quotation marks.

Reply to rewrite:
${cleanReply}`;

  const result =
    await generateReply(
      prompt,
      "Professional",
      length,
      language,
      persona,
      { signal }
    );

  return requireGeneratedText(
    result,
    "No rewritten reply was generated."
  );
}

export async function translateReply({
  reply,
  targetLanguage,
  length,
  persona,
  signal,
}) {
  const cleanReply =
    requireReply(reply);

  const prompt = `Translate the following reply into ${targetLanguage}.

Preserve the original meaning, tone and formatting.
Return only the translated reply.
Do not include headings, explanations, notes or quotation marks.

Reply to translate:
${cleanReply}`;

  const result =
    await generateReply(
      prompt,
      "Professional",
      length,
      targetLanguage,
      persona,
      { signal }
    );

  return requireGeneratedText(
    result,
    "No translated reply was generated."
  );
}

export async function runReplyTool({
  tool,
  reply,
  tone,
  length,
  language,
  persona,
  customInstruction,
  signal,
}) {
  const cleanReply =
    requireReply(reply);

  const instruction =
    customInstruction ||
    TOOL_INSTRUCTIONS[tool];

  if (!instruction) {
    throw new Error(
      "Unknown AI tool selected."
    );
  }

  const prompt = `${instruction}

Return only the improved reply.
Do not add explanations or quotation marks.

Reply:
${cleanReply}`;

  const result =
    await generateReply(
      prompt,
      tone,
      length,
      language,
      persona,
      { signal }
    );

  return requireGeneratedText(
    result,
    "No improved reply was generated."
  );
}
