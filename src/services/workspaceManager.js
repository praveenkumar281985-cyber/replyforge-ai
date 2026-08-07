const WORKSPACE_KEY =
  "replyforge_web_workspace_v1";

const DEFAULT_WORKSPACE = {
  message: "",
  reply: "",
  conversationMode: false,
  conversation: [],
  tone: "Professional",
  length: "Medium",
  language: "English",
  persona: "Professional",
  intentResult: null,
  replyScore: null,
};

function isString(value) {
  return typeof value === "string";
}

function normalizeConversation(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (turn) =>
        turn &&
        isString(turn.id) &&
        isString(turn.role) &&
        isString(turn.text)
    )
    .map((turn) => ({
      id: turn.id,
      role: turn.role,
      text: turn.text,
    }))
    .slice(-100);
}

export function normalizeWorkspace(
  workspace
) {
  return {
    message:
      isString(workspace?.message)
        ? workspace.message
        : DEFAULT_WORKSPACE.message,
    reply:
      isString(workspace?.reply)
        ? workspace.reply
        : DEFAULT_WORKSPACE.reply,
    conversationMode:
      Boolean(
        workspace?.conversationMode
      ),
    conversation:
      normalizeConversation(
        workspace?.conversation
      ),
    tone:
      isString(workspace?.tone)
        ? workspace.tone
        : DEFAULT_WORKSPACE.tone,
    length:
      isString(workspace?.length)
        ? workspace.length
        : DEFAULT_WORKSPACE.length,
    language:
      isString(workspace?.language)
        ? workspace.language
        : DEFAULT_WORKSPACE.language,
    persona:
      isString(workspace?.persona)
        ? workspace.persona
        : DEFAULT_WORKSPACE.persona,
    intentResult:
      workspace?.intentResult &&
      typeof workspace.intentResult ===
        "object"
        ? workspace.intentResult
        : null,
    replyScore:
      workspace?.replyScore &&
      typeof workspace.replyScore ===
        "object"
        ? workspace.replyScore
        : null,
  };
}

export function createWorkspaceSnapshot({
  message,
  reply,
  conversationMode,
  conversation,
  tone,
  length,
  language,
  persona,
  intentResult,
  replyScore,
}) {
  return normalizeWorkspace({
    message,
    reply,
    conversationMode,
    conversation,
    tone,
    length,
    language,
    persona,
    intentResult,
    replyScore,
  });
}

export function saveWorkspace(
  workspace
) {
  try {
    const normalized =
      normalizeWorkspace(
        workspace
      );

    localStorage.setItem(
      WORKSPACE_KEY,
      JSON.stringify({
        ...normalized,
        updatedAt:
          new Date().toISOString(),
      })
    );

    return true;
  } catch (error) {
    console.warn(
      "ReplyForge workspace could not be saved:",
      error
    );

    return false;
  }
}

export function loadWorkspace() {
  try {
    const raw =
      localStorage.getItem(
        WORKSPACE_KEY
      );

    if (!raw) {
      return {
        ...DEFAULT_WORKSPACE,
      };
    }

    return normalizeWorkspace(
      JSON.parse(raw)
    );
  } catch (error) {
    console.warn(
      "ReplyForge workspace could not be loaded:",
      error
    );

    return {
      ...DEFAULT_WORKSPACE,
    };
  }
}

export function clearSavedWorkspace() {
  try {
    localStorage.removeItem(
      WORKSPACE_KEY
    );

    return true;
  } catch (error) {
    console.warn(
      "ReplyForge workspace could not be cleared:",
      error
    );

    return false;
  }
}
