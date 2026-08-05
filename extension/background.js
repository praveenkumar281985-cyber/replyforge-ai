
function configureReplyForgeSidePanel() {
  if (!chrome.sidePanel?.setPanelBehavior) {
    return;
  }

  chrome.sidePanel
    .setPanelBehavior({
      openPanelOnActionClick: true,
    })
    .catch((error) => {
      console.error(
        "ReplyForge side panel setup failed:",
        error
      );
    });
}

configureReplyForgeSidePanel();

chrome.runtime.onInstalled.addListener(() => {
  configureReplyForgeSidePanel();
});

importScripts("ai-coach.js");
importScripts("improve.js");

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const GROQ_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const REPLY_STYLES = [
  {
    id: "professional",
    title: "Professional",
  },
  {
    id: "friendly",
    title: "Friendly",
  },
  {
    id: "assertive",
    title: "Assertive",
  },
  {
    id: "empathetic",
    title: "Empathetic",
  },
];

const REWRITE_INSTRUCTIONS = {
  friendly:
    "Rewrite this reply in a warm, natural and friendly tone.",
  professional:
    "Rewrite this reply in a polished, respectful and professional tone.",
  assertive:
    "Rewrite this reply to sound confident, clear and firm without being rude.",
  empathetic:
    "Rewrite this reply to sound understanding, supportive and empathetic.",
  shorter:
    "Make this reply significantly shorter while preserving the important meaning.",
  longer:
    "Expand this reply with useful detail, while staying focused and natural.",
  polite:
    "Rewrite this reply to sound more polite, diplomatic and respectful.",
  email:
    "Rewrite this as a professional email body with a natural greeting and closing.",
  legal:
    "Rewrite this in careful, formal and neutral language. Avoid making unsupported legal claims.",
};

async function getSettings() {
  return chrome.storage.local.get([
    "openRouterApiKey",
    "groqApiKey",
  ]);
}


function normalizeConversationContext(
  context
) {
  const fullContext =
    typeof context?.fullContext ===
    "string"
      ? context.fullContext
          .trim()
          .slice(0, 24000)
      : "";

  return {
    subject:
      typeof context?.subject === "string"
        ? context.subject
            .trim()
            .slice(0, 500)
        : "",
    participants:
      Array.isArray(
        context?.participants
      )
        ? context.participants
            .filter(
              (item) =>
                typeof item ===
                  "string" &&
                item.trim()
            )
            .map(
              (item) =>
                item.trim()
            )
            .slice(0, 20)
        : [],
    fullContext,
  };
}

function buildConversationSection(
  context
) {
  const normalized =
    normalizeConversationContext(
      context
    );

  if (!normalized.fullContext) {
    return "";
  }

  return `

Conversation context:
${
  normalized.subject
    ? `Subject: ${normalized.subject}\n`
    : ""
}${
  normalized.participants.length
    ? `Participants: ${normalized.participants.join(", ")}\n`
    : ""
}
${normalized.fullContext}`;
}

function buildSingleReplyPrompt(
  message,
  tone,
  length,
  conversationContext
) {
  const conversationSection =
    buildConversationSection(
      conversationContext
    );

  return `Write a ready-to-send reply to the latest incoming message.

Tone: ${tone || "Professional"}
Length: ${length || "Medium"}

Rules:
- Respond directly to the latest incoming message.
- Use the conversation context when available.
- Do not repeat points already settled in the thread.
- Preserve important facts and commitments.
- Do not invent information.
- Sound natural and human.
- Do not add headings or explanations.
- Do not use quotation marks around the reply.
- Return only the final reply.
${conversationSection}

Latest incoming message:
${message}`;
}

function buildMultipleRepliesPrompt(
  message,
  length,
  conversationContext
) {
  const conversationSection =
    buildConversationSection(
      conversationContext
    );

  return `You are ReplyForge AI.

Create exactly four different ready-to-send replies to the latest incoming message.

Length: ${length || "Medium"}

Reply styles:
1. Professional: polished, respectful and professional.
2. Friendly: warm, natural and conversational.
3. Assertive: confident, direct and firm without being rude.
4. Empathetic: understanding, supportive and emotionally aware.

Rules:
- Respond directly to the latest incoming message.
- Use the conversation context when available.
- Do not repeat points already settled in the thread.
- Preserve important facts and commitments.
- Do not invent information.
- Do not include explanations.
- Do not use markdown code fences.
- Return only valid JSON using this exact structure:

{
  "professional": "Reply here",
  "friendly": "Reply here",
  "assertive": "Reply here",
  "empathetic": "Reply here"
}
${conversationSection}

Latest incoming message:
${message}`;
}

function buildRewritePrompt(reply, rewriteAction) {
  const instruction =
    REWRITE_INSTRUCTIONS[rewriteAction];

  if (!instruction) {
    throw new Error("Unsupported rewrite option.");
  }

  return `You are ReplyForge AI.

${instruction}

Rules:
- Preserve the original meaning and important facts.
- Do not invent information.
- Return only the rewritten reply.
- Do not add headings, explanations, notes or quotation marks.

Original reply:
${reply}`;
}

async function callOpenRouter(apiKey, prompt) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": chrome.runtime.getURL("/"),
      "X-Title": "ReplyForge AI Extension",
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.72,
      max_tokens: 1800,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.error?.message ||
        `OpenRouter failed (${response.status}).`
    );

    error.status = response.status;
    throw error;
  }

  const reply =
    data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error(
      "OpenRouter returned an empty response."
    );
  }

  return reply;
}

async function callGroq(apiKey, prompt) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.72,
      max_tokens: 1800,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.error?.message ||
        `Groq failed (${response.status}).`
    );

    error.status = response.status;
    throw error;
  }

  const reply =
    data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("Groq returned an empty response.");
  }

  return reply;
}

async function callAvailableProvider(prompt) {
  const settings = await getSettings();
  const errors = [];

  if (!settings.openRouterApiKey && !settings.groqApiKey) {
    throw new Error(
      "Add an OpenRouter or Groq API key in the extension settings."
    );
  }

  if (settings.openRouterApiKey) {
    try {
      return await callOpenRouter(
        settings.openRouterApiKey,
        prompt
      );
    } catch (error) {
      console.warn("OpenRouter failed. Trying Groq.", error);
      errors.push(error);
    }
  }

  if (settings.groqApiKey) {
    try {
      return await callGroq(
        settings.groqApiKey,
        prompt
      );
    } catch (error) {
      console.warn("Groq failed.", error);
      errors.push(error);
    }
  }

  throw new Error(
    errors
      .map((error) => error?.message)
      .filter(Boolean)
      .join(" | ") ||
      "All configured AI providers failed."
  );
}

function cleanJsonResponse(response) {
  return response
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function normalizeMultipleReplies(result) {
  return REPLY_STYLES.map((style) => {
    const reply =
      typeof result?.[style.id] === "string"
        ? result[style.id].trim()
        : "";

    if (!reply) {
      throw new Error(
        `${style.title} reply was missing from the AI response.`
      );
    }

    return {
      id: style.id,
      title: style.title,
      reply,
    };
  });
}

async function generateSingleReply(request) {
  const message = request.message?.trim();

  if (!message) {
    throw new Error("No incoming message was provided.");
  }

  return callAvailableProvider(
    buildSingleReplyPrompt(
      message,
      request.tone,
      request.length,
      request.conversationContext
    )
  );
}

async function generateMultipleReplies(request) {
  const message = request.message?.trim();

  if (!message) {
    throw new Error("No incoming message was provided.");
  }

  const response = await callAvailableProvider(
    buildMultipleRepliesPrompt(
      message,
      request.length,
      request.conversationContext
    )
  );

  try {
    const parsed = JSON.parse(
      cleanJsonResponse(response)
    );

    return normalizeMultipleReplies(parsed);
  } catch (error) {
    console.error(
      "Multiple reply parsing error:",
      error,
      response
    );

    throw new Error(
      "The AI could not create valid reply suggestions. Please try again."
    );
  }
}

async function rewriteReply(request) {
  const reply = request.reply?.trim();
  const rewriteAction = request.rewriteAction?.trim();

  if (!reply) {
    throw new Error("No reply was provided for rewriting.");
  }

  const rewrittenReply = await callAvailableProvider(
    buildRewritePrompt(reply, rewriteAction)
  );

  return {
    reply: rewrittenReply,
    title:
      rewriteAction === "polite"
        ? "More Polite"
        : rewriteAction === "email"
          ? "Email Style"
          : rewriteAction === "legal"
            ? "Legal Style"
            : rewriteAction
              ? rewriteAction.charAt(0).toUpperCase() +
                rewriteAction.slice(1)
              : "Rewritten",
  };
}


async function analyzeReply(request) {
  const reply = request.reply?.trim();

  if (!reply) {
    throw new Error("No reply was provided for analysis.");
  }

  const coach = globalThis.ReplyForgeAICoach;

  if (
    !coach ||
    typeof coach.buildAnalysisPrompt !== "function" ||
    typeof coach.parseAnalysisResponse !== "function"
  ) {
    throw new Error("AI Coach module is not available.");
  }

  const prompt = coach.buildAnalysisPrompt(reply);
  const response = await callAvailableProvider(prompt);

  return coach.parseAnalysisResponse(response);
}


async function improveReply(request) {
  const reply = request.reply?.trim();
  const improveModule =
    globalThis.ReplyForgeImprove;

  if (!reply) {
    throw new Error(
      "No reply was provided for improvement."
    );
  }

  if (
    !improveModule ||
    typeof improveModule.buildImprovePrompt !==
      "function" ||
    typeof improveModule.parseImproveResponse !==
      "function"
  ) {
    throw new Error(
      "Reply Improver module is not available."
    );
  }

  const prompt =
    improveModule.buildImprovePrompt(
      reply,
      request.analysis || {}
    );

  const response =
    await callAvailableProvider(prompt);

  return improveModule.parseImproveResponse(
    response
  );
}

chrome.runtime.onMessage.addListener(
  (request, _sender, sendResponse) => {
    if (request?.type === "GENERATE_REPLY") {
      generateSingleReply(request)
        .then((reply) => {
          sendResponse({
            success: true,
            reply,
          });
        })
        .catch((error) => {
          console.error(
            "ReplyForge generation error:",
            error
          );

          sendResponse({
            success: false,
            error:
              error?.message ||
              "Reply could not be generated.",
          });
        });

      return true;
    }

    if (
      request?.type ===
      "GENERATE_MULTIPLE_REPLIES"
    ) {
      generateMultipleReplies(request)
        .then((replies) => {
          sendResponse({
            success: true,
            replies,
            reply: replies[0]?.reply || "",
          });
        })
        .catch((error) => {
          console.error(
            "Multiple reply generation error:",
            error
          );

          sendResponse({
            success: false,
            error:
              error?.message ||
              "Reply suggestions could not be generated.",
          });
        });

      return true;
    }

    if (request?.type === "ANALYZE_REPLY") {
      analyzeReply(request)
        .then((analysis) => {
          sendResponse({
            success: true,
            analysis,
          });
        })
        .catch((error) => {
          console.error(
            "Reply analysis error:",
            error
          );

          sendResponse({
            success: false,
            error:
              error?.message ||
              "Reply could not be analyzed.",
          });
        });

      return true;
    }

    if (request?.type === "IMPROVE_REPLY") {
      improveReply(request)
        .then((reply) => {
          sendResponse({
            success: true,
            reply,
          });
        })
        .catch((error) => {
          console.error(
            "Reply improvement error:",
            error
          );

          sendResponse({
            success: false,
            error:
              error?.message ||
              "Reply could not be improved.",
          });
        });

      return true;
    }

    if (request?.type === "REWRITE_REPLY") {
      rewriteReply(request)
        .then((result) => {
          sendResponse({
            success: true,
            ...result,
          });
        })
        .catch((error) => {
          console.error(
            "Reply rewrite error:",
            error
          );

          sendResponse({
            success: false,
            error:
              error?.message ||
              "Reply could not be rewritten.",
          });
        });

      return true;
    }

    return false;
  }
);
