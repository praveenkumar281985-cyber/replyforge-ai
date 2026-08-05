const MODEL =
  import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

function getApiKey() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env file."
    );
  }

  return apiKey;
}

function createBody(prompt) {
  return {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.78,
      topP: 0.92,
      maxOutputTokens: 2048,
    },
  };
}

function extractErrorMessage(payload, fallback) {
  return (
    payload?.error?.message ||
    payload?.message ||
    fallback ||
    "Gemini request failed."
  );
}

function extractText(payload) {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("") || ""
  );
}

export async function generateReply(
  prompt,
  _tone,
  _length,
  _language,
  _persona
) {
  const apiKey = getApiKey();
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createBody(prompt)),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload, `Gemini request failed (${response.status}).`)
    );
  }

  const text = extractText(payload).trim();

  if (!text) {
    throw new Error(
      payload?.promptFeedback?.blockReason
        ? `Reply blocked: ${payload.promptFeedback.blockReason}`
        : "Gemini returned an empty response."
    );
  }

  return text;
}

export async function streamReply(
  prompt,
  _tone,
  _length,
  _language,
  _persona,
  { signal, onText } = {}
) {
  const apiKey = getApiKey();
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(createBody(prompt)),
    signal,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      extractErrorMessage(payload, `Gemini request failed (${response.status}).`)
    );
  }

  if (!response.body) {
    return generateReply(prompt);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  function processEvent(rawEvent) {
    const data = rawEvent
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .join("");

    if (!data || data === "[DONE]") return;

    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      return;
    }

    if (payload?.error) {
      throw new Error(extractErrorMessage(payload));
    }

    const chunkText = extractText(payload);

    if (chunkText) {
      fullText += chunkText;
      onText?.(fullText);
    }
  }

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || "";

    for (const event of events) {
      processEvent(event);
    }

    if (done) break;
  }

  if (buffer.trim()) {
    processEvent(buffer);
  }

  const cleanText = fullText.trim();

  if (!cleanText) {
    throw new Error("Gemini returned an empty streamed response.");
  }

  return cleanText;
}
