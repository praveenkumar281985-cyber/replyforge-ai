/**
 * Pure helpers for Messaura conversation mode.
 *
 * These functions do not know about React state. App.jsx passes the
 * current conversation in and receives the next conversation back.
 */

export function createConversationTurn(
  role,
  text
) {
  const cleanText =
    String(text || "").trim();

  if (!cleanText) {
    return null;
  }

  return {
    id: `${role}-${Date.now()}`,
    role,
    text: cleanText,
  };
}

export function addConversationTurn(
  conversation,
  role,
  text
) {
  const turn =
    createConversationTurn(
      role,
      text
    );

  if (!turn) {
    return conversation;
  }

  return [
    ...conversation,
    turn,
  ];
}

export function updateConversationTurn(
  conversation,
  id,
  text
) {
  return conversation.map(
    (turn) =>
      turn.id === id
        ? {
            ...turn,
            text,
          }
        : turn
  );
}

export function deleteConversationTurn(
  conversation,
  id
) {
  return conversation.filter(
    (turn) =>
      turn.id !== id
  );
}

export function appendGeneratedConversationReply({
  conversation,
  cleanMessage,
  cleanReply,
  isRegenerate,
}) {
  const withoutLastAssistant =
    isRegenerate &&
    conversation.at(-1)?.role ===
      "assistant"
      ? conversation.slice(0, -1)
      : conversation;

  const next = [
    ...withoutLastAssistant,
  ];

  if (
    cleanMessage &&
    !isRegenerate
  ) {
    next.push({
      id:
        `customer-${Date.now()}`,
      role: "customer",
      text: cleanMessage,
    });
  }

  next.push({
    id:
      `assistant-${Date.now() + 1}`,
    role: "assistant",
    text: cleanReply,
  });

  return next;
}

export function getConversationModeState(
  nextMode
) {
  return {
    conversationMode:
      nextMode === "conversation",
    reply: "",
    replyScore: null,
    error: "",
  };
}

export function clearConversationWorkspace() {
  return {
    message: "",
    reply: "",
    conversation: [],
    replyScore: null,
    intentResult: null,
    error: "",
  };
}
