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

  const responseText = await response.text();

  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        "API server is unavailable here. Please test on the live Vercel website."
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        `API request failed with status ${response.status}`
    );
  }

  if (!data.reply) {
    throw new Error("No reply was returned by the API.");
  }

  return data.reply;
}