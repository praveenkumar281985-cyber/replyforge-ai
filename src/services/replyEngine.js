import { streamReply } from "./aiService";
import { buildSmartReplyPrompt } from "./promptBuilder";
import { saveReplyToCloud } from "./history";

/**
 * Runs the core Messaura generation workflow.
 *
 * UI state remains in App.jsx. This module owns:
 * - prompt creation
 * - streaming AI request
 * - final reply validation
 * - cloud history save
 */
export async function runReplyGeneration({
  action,
  session,
  message,
  conversationMode,
  conversation,
  tone,
  length,
  language,
  persona,
  signal,
  onText,
}) {
  const isRegenerate =
    action === "regenerate";

  const cleanMessage =
    message.trim();

  const hasConversation =
    conversationMode &&
    conversation.length > 0;

  if (
    !cleanMessage &&
    !hasConversation
  ) {
    throw new Error(
      conversationMode
        ? "Add at least one conversation message before generating a reply."
        : "Please enter a message before generating a reply."
    );
  }

  if (!session?.user?.id) {
    throw new Error(
      "Please login again."
    );
  }

  const conversationWithDraft =
    conversationMode
      ? [
          ...conversation,
          ...(cleanMessage
            ? [
                {
                  id:
                    `draft-${Date.now()}`,
                  role: "customer",
                  text: cleanMessage,
                },
              ]
            : []),
        ]
      : [];

  const latestIncomingMessage =
    conversationMode
      ? [
          ...conversationWithDraft,
        ]
          .reverse()
          .find(
            (turn) =>
              turn.role ===
              "customer"
          )?.text ||
        cleanMessage
      : cleanMessage;

  const promptMessage =
    buildSmartReplyPrompt({
      message: cleanMessage,
      conversation:
        conversationWithDraft,
      conversationMode,
      tone,
      length,
      language,
      persona,
      isRegenerate,
    });

  const generatedReply =
    await streamReply(
      promptMessage,
      tone,
      length,
      language,
      persona,
      {
        signal,
        onText,
      }
    );

  if (!generatedReply?.trim()) {
    throw new Error(
      "No reply was generated."
    );
  }

  const cleanReply =
    generatedReply.trim();

  const historyMessage =
    conversationMode
      ? conversationWithDraft
          .map(
            (turn) =>
              `${
                turn.role ===
                "customer"
                  ? "Customer"
                  : "You"
              }: ${turn.text}`
          )
          .join("\n\n")
      : cleanMessage;

  const savedItem =
    await saveReplyToCloud({
      userId:
        session.user.id,
      originalMessage:
        historyMessage ||
        latestIncomingMessage,
      generatedReply:
        cleanReply,
      tone,
    });

  return {
    cleanReply,
    cleanMessage,
    isRegenerate,
    conversationWithDraft,
    latestIncomingMessage,
    savedItem,
  };
}
