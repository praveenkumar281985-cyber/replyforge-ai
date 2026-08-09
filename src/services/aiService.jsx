import supabase from "../lib/supabase";
import {
  getProviderPreference,
  orderProvidersByPreference,
} from "./providerManager";

const PROVIDERS = [
  {
    id: "openrouter",
    label: "OpenRouter",
    model:
      import.meta.env.VITE_OPENROUTER_MODEL?.trim() ||
      "openrouter/free",
  },
  {
    id: "groq",
    label: "Groq",
    model:
      import.meta.env.VITE_GROQ_MODEL?.trim() ||
      "llama-3.1-8b-instant",
  },
  {
    id: "gemini",
    label: "Gemini",
    model:
      import.meta.env.VITE_GEMINI_MODEL?.trim() ||
      "gemini-2.5-flash",
  },
];

let lastSuccessfulProviderId = "";
let lastSuccessfulModel = "";

function getOrderedProviders() {
  return orderProvidersByPreference(
    PROVIDERS,
    getProviderPreference()
  );
}

function getSelectedProvider() {
  const preference = getProviderPreference();
  const providers = getOrderedProviders();

  return (
    providers.find(
      (provider) => provider.id === lastSuccessfulProviderId
    ) ||
    (preference.mode === "manual"
      ? providers.find(
          (provider) => provider.id === preference.providerId
        )
      : null) ||
    providers[0]
  );
}

export function getAiProviderStatus() {
  const activeProvider = getSelectedProvider();

  return {
    online: true,
    id: activeProvider?.id || "openrouter",
    label: activeProvider?.label || "AI Provider",
    model:
      lastSuccessfulProviderId === activeProvider?.id &&
      lastSuccessfulModel
        ? lastSuccessfulModel
        : activeProvider?.model || "",
    configuredProviders: PROVIDERS.map((provider) => ({
      id: provider.id,
      label: provider.label,
      model: provider.model,
    })),
  };
}

function createAbortError() {
  return new DOMException("Request cancelled.", "AbortError");
}

function getFunctionErrorMessage(data, error) {
  return (
    data?.error ||
    data?.message ||
    error?.message ||
    "Unable to generate a reply. Please try again."
  );
}

async function invokeGenerateReply(
  prompt,
  tone,
  length,
  language,
  persona,
  signal
) {
  if (signal?.aborted) {
    throw createAbortError();
  }

  const cleanPrompt =
    typeof prompt === "string" ? prompt.trim() : "";

  if (!cleanPrompt) {
    throw new Error("Prompt is required.");
  }

  const preference = getProviderPreference();

  const { data, error } = await supabase.functions.invoke(
    "generate-reply",
    {
      body: {
        prompt: cleanPrompt,
        tone: tone || "Professional",
        length: length || "Medium",
        language: language || "English",
        persona: persona || "Professional",
        mode: preference.mode,
        providerId:
          preference.mode === "manual"
            ? preference.providerId
            : "",
      },
    }
  );

  if (signal?.aborted) {
    throw createAbortError();
  }

  if (error || data?.error) {
    throw new Error(getFunctionErrorMessage(data, error));
  }

  const reply =
    typeof data?.reply === "string" ? data.reply.trim() : "";

  if (!reply) {
    throw new Error("The AI provider returned an empty response.");
  }

  if (data?.provider) {
    lastSuccessfulProviderId = data.provider;
    lastSuccessfulModel = data?.model || "";
  }

  return reply;
}

export async function generateReply(
  prompt,
  tone,
  length,
  language,
  persona,
  { signal } = {}
) {
  return invokeGenerateReply(
    prompt,
    tone,
    length,
    language,
    persona,
    signal
  );
}

export async function streamReply(
  prompt,
  tone,
  length,
  language,
  persona,
  { signal, onText } = {}
) {
  const reply = await invokeGenerateReply(
    prompt,
    tone,
    length,
    language,
    persona,
    signal
  );

  onText?.(reply);
  return reply;
}
