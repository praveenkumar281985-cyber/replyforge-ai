
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

const REPLYFORGE_SUPPORTED_HOSTS = new Set([
  "mail.google.com",
  "web.whatsapp.com",
  "www.linkedin.com",
]);

function isReplyForgeSupportedUrl(url) {
  try {
    return REPLYFORGE_SUPPORTED_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

async function syncReplyForgeSidePanelForTab(tabId, url) {
  if (!chrome.sidePanel?.setOptions || !Number.isInteger(tabId)) {
    return;
  }

  try {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "sidepanel.html",
      enabled: isReplyForgeSupportedUrl(url),
    });
  } catch (error) {
    console.error("ReplyForge side panel tab sync failed:", error);
  }
}

async function syncActiveReplyForgeSidePanel() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab?.id != null) {
    await syncReplyForgeSidePanelForTab(activeTab.id, activeTab.url);
  }
}

configureReplyForgeSidePanel();

chrome.runtime.onInstalled.addListener(() => {
  configureReplyForgeSidePanel();
  syncActiveReplyForgeSidePanel().catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  syncActiveReplyForgeSidePanel().catch(console.error);
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    await syncReplyForgeSidePanelForTab(tabId, tab.url);
  } catch (error) {
    console.error("ReplyForge active tab check failed:", error);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    syncReplyForgeSidePanelForTab(tabId, changeInfo.url || tab.url).catch(console.error);
  }
});

importScripts("ai-coach.js");
importScripts("improve.js");

const SUPABASE_URL = "https://dyunvmfsastrhyxzscmp.supabase.co";
const SUPABASE_KEY = "sb_publishable__bK9-276AJnDSEIqb1gjQA_-78UQwnY";
const SESSION_STORAGE_KEY = "replyForgeSupabaseSession";
const RF_SETTINGS_KEY = "replyforge_settings_v320";
const PROVIDER_LABELS = {
  groq: "Groq",
  openrouter: "OpenRouter",
  gemini: "Gemini",
};
let lastProviderId = "";

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

async function getSession() {
  const stored = await chrome.storage.local.get(SESSION_STORAGE_KEY);
  return stored[SESSION_STORAGE_KEY] || null;
}

async function saveSession(session) {
  await chrome.storage.local.set({ [SESSION_STORAGE_KEY]: session });
  return session;
}

async function clearSession() {
  await chrome.storage.local.remove(SESSION_STORAGE_KEY);
}

async function refreshSession(session) {
  if (!session?.refresh_token) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.access_token) {
    await clearSession();
    return null;
  }
  return saveSession(data);
}

async function requireSession() {
  let session = await getSession();
  if (!session?.access_token) throw new Error("Please sign in with Google from ReplyForge settings first.");
  if (Number(session.expires_at || 0) * 1000 <= Date.now() + 60000) session = await refreshSession(session);
  if (!session?.access_token) throw new Error("Your session expired. Please sign in with Google again.");
  return session;
}

async function signInWithGoogle() {
  const redirectUrl = chrome.identity.getRedirectURL("supabase-auth");
  const authUrl = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  authUrl.searchParams.set("provider", "google");
  authUrl.searchParams.set("redirect_to", redirectUrl);
  authUrl.searchParams.set("scopes", "openid email profile");
  const resultUrl = await chrome.identity.launchWebAuthFlow({ url: authUrl.toString(), interactive: true });
  if (!resultUrl) throw new Error("Google sign-in was cancelled.");
  const params = new URLSearchParams(new URL(resultUrl).hash.slice(1));
  const error = params.get("error_description") || params.get("error");
  if (error) throw new Error(error);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) throw new Error("Google sign-in did not return a valid session.");
  return saveSession({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: Math.floor(Date.now() / 1000) + Number(params.get("expires_in") || 3600),
    token_type: params.get("token_type") || "bearer",
  });
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
  conversationContext,
  language
) {
  const conversationSection =
    buildConversationSection(
      conversationContext
    );

  return `Write a ready-to-send reply to the latest incoming message.

Tone: ${tone || "Professional"}
Length: ${length || "Medium"}
Language: ${language || "Auto-detect from the incoming message"}

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
  conversationContext,
  language
) {
  const conversationSection =
    buildConversationSection(
      conversationContext
    );

  return `You are ReplyForge AI.

Create exactly four different ready-to-send replies to the latest incoming message.

Length: ${length || "Medium"}
Language: ${language || "Auto-detect from the incoming message"}

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

async function getProviderPreference() {
  const stored = await chrome.storage.local.get(RF_SETTINGS_KEY);
  const providerId = stored?.[RF_SETTINGS_KEY]?.providerId || "auto";
  return ["groq", "openrouter", "gemini"].includes(providerId)
    ? { mode: "manual", providerId }
    : { mode: "auto", providerId: "" };
}

async function callReplyForgeBackend(prompt) {
  const session = await requireSession();
  const providerPreference = await getProviderPreference();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-reply`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      tone: "Professional",
      length: "Medium",
      language: "English",
      persona: "Professional",
      mode: providerPreference.mode,
      providerId: providerPreference.providerId,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    const refreshed = await refreshSession(session);
    if (!refreshed) throw new Error("Your session expired. Please sign in with Google again.");
    return callReplyForgeBackend(prompt);
  }
  if (!response.ok) {
    throw new Error(data?.error || data?.message || `ReplyForge request failed (${response.status}).`);
  }
  const reply = typeof data?.reply === "string" ? data.reply.trim() : "";
  if (!reply) throw new Error("ReplyForge returned an empty response.");
  lastProviderId = typeof data?.provider === "string" ? data.provider.toLowerCase() : providerPreference.providerId;
  return reply;
}

async function callAvailableProvider(prompt) {
  return callReplyForgeBackend(prompt);
}

async function getDailyUsage() {
  const session = await requireSession();
  const today = new Date().toISOString().slice(0, 10);
  const query = new URLSearchParams({
    select: "request_count",
    usage_date: `eq.${today}`,
    limit: "1",
  });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/ai_usage_daily?${query}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      Accept: "application/json",
    },
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) throw new Error("Daily usage could not be loaded.");
  const used = Number(Array.isArray(data) ? data[0]?.request_count : 0) || 0;
  return { used, remaining: Math.max(0, 30 - used), limit: 30 };
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
      request.conversationContext,
      request.language
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
      request.conversationContext,
      request.language
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
      "The AI could not create valid reply suggestions. Please try again.",
      { cause: error }
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
    if (request?.type === "GET_USAGE") {
      getDailyUsage()
        .then((usage) => sendResponse({ success: true, signedIn: true, ...usage }))
        .catch(async (error) => {
          const session = await getSession();
          sendResponse({ success: false, signedIn: Boolean(session?.access_token), error: error?.message });
        });
      return true;
    }

    if (request?.type === "AUTH_STATUS") {
      getSession().then((session) => sendResponse({ success: true, signedIn: Boolean(session?.access_token) }));
      return true;
    }

    if (request?.type === "AUTH_SIGN_IN") {
      signInWithGoogle()
        .then(() => sendResponse({ success: true, signedIn: true }))
        .catch((error) => sendResponse({ success: false, error: error?.message || "Google sign-in failed." }));
      return true;
    }

    if (request?.type === "AUTH_SIGN_OUT") {
      clearSession().then(() => sendResponse({ success: true, signedIn: false }));
      return true;
    }

    if (request?.type === "GENERATE_REPLY") {
      generateSingleReply(request)
        .then((reply) => {
          sendResponse({
            success: true,
            reply,
            provider: lastProviderId,
            providerLabel: PROVIDER_LABELS[lastProviderId] || "",
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
            provider: lastProviderId,
            providerLabel: PROVIDER_LABELS[lastProviderId] || "",
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
