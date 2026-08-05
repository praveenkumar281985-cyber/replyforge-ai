(function initializeReplyForgeImprove() {
  function buildImprovePrompt(reply, analysis) {
    const cleanReply =
      typeof reply === "string"
        ? reply.trim()
        : "";

    if (!cleanReply) {
      throw new Error(
        "A reply is required for improvement."
      );
    }

    const verdict =
      typeof analysis?.verdict === "string"
        ? analysis.verdict.trim()
        : "";

    const suggestions =
      Array.isArray(analysis?.suggestions)
        ? analysis.suggestions
            .filter(
              (item) =>
                typeof item === "string" &&
                item.trim()
            )
            .map((item) => `- ${item.trim()}`)
            .slice(0, 5)
            .join("\n")
        : "";

    return `You are ReplyForge AI Reply Improver.

Improve the reply below using the available AI Coach feedback.

Rules:
- Preserve the original meaning and important facts.
- Correct grammar and improve clarity.
- Improve professionalism, confidence and politeness where appropriate.
- Add or strengthen the next step only when it fits naturally.
- Keep the result concise and human.
- Do not invent facts, promises, dates or commitments.
- Do not add headings, explanations, notes or quotation marks.
- Return only the improved ready-to-send reply.

AI Coach verdict:
${verdict || "No verdict was provided."}

AI Coach suggestions:
${suggestions || "- Improve the reply's overall communication quality."}

Original reply:
${cleanReply}`;
  }

  function parseImproveResponse(response) {
    const improvedReply =
      String(response || "")
        .replace(/```(?:text)?/gi, "")
        .replace(/```/g, "")
        .trim();

    if (!improvedReply) {
      throw new Error(
        "AI returned an empty improved reply."
      );
    }

    return improvedReply;
  }

  globalThis.ReplyForgeImprove = {
    buildImprovePrompt,
    parseImproveResponse,
  };
})();
