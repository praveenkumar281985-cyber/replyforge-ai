export async function generateReply(
  message,
  tone,
  length,
  language
) {
  const response = await fetch("/api/generate-reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      tone,
      length,
      language,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to generate reply"
    );
  }

  if (!data.reply) {
    throw new Error("No reply was generated");
  }

  return data.reply;
}