import { getProviderPreference, orderProvidersByPreference } from "./providerManager";

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const GROQ_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const OPENROUTER_MODEL =
  import.meta.env.VITE_OPENROUTER_MODEL?.trim() ||
  "openrouter/free";

const GROQ_MODEL =
  import.meta.env.VITE_GROQ_MODEL?.trim() ||
  "llama-3.1-8b-instant";

const GEMINI_MODEL =
  import.meta.env.VITE_GEMINI_MODEL?.trim() ||
  "gemini-2.5-flash";

function getEnvKey(name) {
  return import.meta.env[name]?.trim() || "";
}

function getProviders() {
  const providers = [];

  const openRouterKey = getEnvKey(
    "VITE_OPENROUTER_API_KEY"
  );

  const groqKey = getEnvKey("VITE_GROQ_API_KEY");

  const geminiKey = getEnvKey(
    "VITE_GEMINI_API_KEY"
  );

  if (openRouterKey) {
    providers.push({
      id: "openrouter",
      label: "OpenRouter",
      type: "openai",
      url: OPENROUTER_URL,
      apiKey: openRouterKey,
      model: OPENROUTER_MODEL,
      extraHeaders: {
        "HTTP-Referer": window.location.origin,
        "X-Title": "ReplyForge AI",
      },
    });
  }

  if (groqKey) {
    providers.push({
      id: "groq",
      label: "Groq",
      type: "openai",
      url: GROQ_URL,
      apiKey: groqKey,
      model: GROQ_MODEL,
      extraHeaders: {},
    });
  }

  if (geminiKey) {
    providers.push({
      id: "gemini",
      label: "Gemini",
      type: "gemini",
      apiKey: geminiKey,
      model: GEMINI_MODEL,
    });
  }

  if (!providers.length) {
    throw new Error(
      "No AI API key is configured. Add an OpenRouter, Groq, or Gemini key to your .env file."
    );
  }

  return orderProvidersByPreference(providers, getProviderPreference());
}


let lastSuccessfulProviderId = "";

function setLastSuccessfulProvider(provider) {
  lastSuccessfulProviderId =
    provider?.id || "";
}

export function getAiProviderStatus() {
  try {
    const providers =
      getProviders();

    const activeProvider =
      providers.find(
        (provider) =>
          provider.id ===
          lastSuccessfulProviderId
      ) || providers[0];

    return {
      online: true,
      id:
        activeProvider?.id ||
        "unknown",
      label:
        activeProvider?.label ||
        "AI Provider",
      model:
        activeProvider?.model ||
        "",
      configuredProviders:
        providers.map(
          (provider) => ({
            id: provider.id,
            label: provider.label,
            model: provider.model,
          })
        ),
    };
  } catch (error) {
    return {
      online: false,
      id: "offline",
      label: "AI Offline",
      model: "",
      configuredProviders: [],
      error:
        error?.message ||
        "No AI provider is configured.",
    };
  }
}

function createOpenAiBody(prompt, model, stream) {
  return {
    model,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.72,
    max_tokens: 1600,
    stream,
  };
}

function createGeminiBody(prompt) {
  return {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.72,
      topP: 0.92,
      maxOutputTokens: 1600,
    },
  };
}

function extractErrorMessage(payload, fallback) {
  return (
    payload?.error?.message ||
    payload?.message ||
    fallback
  );
}

function createProviderError(
  provider,
  status,
  message
) {
  const error = new Error(
    `${provider.label}: ${message}`
  );

  error.provider = provider.id;
  error.status = status;

  return error;
}

async function readJsonError(
  response,
  provider
) {
  const payload = await response
    .json()
    .catch(() => null);

  const message = extractErrorMessage(
    payload,
    `Request failed (${response.status}).`
  );

  return createProviderError(
    provider,
    response.status,
    message
  );
}

function extractOpenAiText(payload) {
  return (
    payload?.choices?.[0]?.message?.content ||
    ""
  );
}

function extractGeminiText(payload) {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("") || ""
  );
}

async function generateWithOpenAiProvider(
  provider,
  prompt,
  signal
) {
  const response = await fetch(provider.url, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
      ...provider.extraHeaders,
    },
    body: JSON.stringify(
      createOpenAiBody(
        prompt,
        provider.model,
        false
      )
    ),
  });

  if (!response.ok) {
    throw await readJsonError(response, provider);
  }

  const payload = await response.json();

  const text = extractOpenAiText(payload).trim();

  if (!text) {
    throw createProviderError(
      provider,
      502,
      "The provider returned an empty response."
    );
  }

  return text;
}

async function generateWithGemini(
  provider,
  prompt,
  signal
) {
  const url =
    `${GEMINI_BASE_URL}/${provider.model}:generateContent` +
    `?key=${encodeURIComponent(provider.apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(createGeminiBody(prompt)),
  });

  if (!response.ok) {
    throw await readJsonError(response, provider);
  }

  const payload = await response.json();
  const text = extractGeminiText(payload).trim();

  if (!text) {
    throw createProviderError(
      provider,
      502,
      "The provider returned an empty response."
    );
  }

  return text;
}

async function generateWithProvider(
  provider,
  prompt,
  signal
) {
  if (provider.type === "gemini") {
    return generateWithGemini(
      provider,
      prompt,
      signal
    );
  }

  return generateWithOpenAiProvider(
    provider,
    prompt,
    signal
  );
}

function normalizeFinalError(errors) {
  const messages = errors
    .map((error) => error?.message)
    .filter(Boolean);

  const rateLimited = errors.some(
    (error) => error?.status === 429
  );

  if (rateLimited) {
    return new Error(
      "All available free AI providers are temporarily rate-limited. Please wait a moment and try again."
    );
  }

  return new Error(
    messages.length
      ? `All AI providers failed. ${messages.join(
          " | "
        )}`
      : "All AI providers failed."
  );
}

export async function generateReply(
  prompt,
  _tone,
  _length,
  _language,
  _persona,
  { signal } = {}
) {
  const providers = getProviders();
  const errors = [];

  for (const provider of providers) {
    try {
      const text =
        await generateWithProvider(
          provider,
          prompt,
          signal
        );

      setLastSuccessfulProvider(
        provider
      );

      return text;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw error;
      }

      console.warn(
        `${provider.label} failed. Trying fallback.`,
        error
      );

      errors.push(error);
    }
  }

  throw normalizeFinalError(errors);
}

async function streamOpenAiProvider(
  provider,
  prompt,
  signal,
  onText
) {
  const response = await fetch(provider.url, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...provider.extraHeaders,
    },
    body: JSON.stringify(
      createOpenAiBody(
        prompt,
        provider.model,
        true
      )
    ),
  });

  if (!response.ok) {
    throw await readJsonError(response, provider);
  }

  if (!response.body) {
    const text =
      await generateWithOpenAiProvider(
        provider,
        prompt,
        signal
      );

    onText?.(text);
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let fullText = "";
  let finished = false;

  function processEvent(rawEvent) {
    const lines = rawEvent.split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (
        !line ||
        line.startsWith(":") ||
        !line.startsWith("data:")
      ) {
        continue;
      }

      const data = line.slice(5).trim();

      if (!data) {
        continue;
      }

      if (data === "[DONE]") {
        finished = true;
        continue;
      }

      let payload;

      try {
        payload = JSON.parse(data);
      } catch {
        continue;
      }

      if (payload?.error) {
        throw createProviderError(
          provider,
          payload?.error?.code || 502,
          payload.error.message ||
            "Streaming failed."
        );
      }

      const chunk =
        payload?.choices?.[0]?.delta?.content ||
        "";

      if (chunk) {
        fullText += chunk;
        onText?.(fullText);
      }
    }
  }

  while (!finished) {
    const { value, done } =
      await reader.read();

    buffer += decoder.decode(
      value || new Uint8Array(),
      { stream: !done }
    );

    const events =
      buffer.split(/\r?\n\r?\n/);

    buffer = events.pop() || "";

    for (const event of events) {
      processEvent(event);
    }

    if (done) {
      break;
    }
  }

  if (buffer.trim()) {
    processEvent(buffer);
  }

  const cleanText = fullText.trim();

  if (!cleanText) {
    throw createProviderError(
      provider,
      502,
      "The provider returned an empty streamed response."
    );
  }

  return cleanText;
}

export async function streamReply(
  prompt,
  _tone,
  _length,
  _language,
  _persona,
  { signal, onText } = {}
) {
  const providers = getProviders();
  const errors = [];

  for (const provider of providers) {
    try {
      if (provider.type === "openai") {
        const text =
          await streamOpenAiProvider(
            provider,
            prompt,
            signal,
            onText
          );

        setLastSuccessfulProvider(
          provider
        );

        return text;
      }

      const text = await generateWithGemini(
        provider,
        prompt,
        signal
      );

      setLastSuccessfulProvider(
        provider
      );

      onText?.(text);
      return text;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw error;
      }

      console.warn(
        `${provider.label} failed. Trying fallback.`,
        error
      );

      errors.push(error);
    }
  }

  throw normalizeFinalError(errors);
}
