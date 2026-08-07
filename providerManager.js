const STORAGE_KEY = "replyforge_ai_provider_preference_v1";

const DEFAULT_PREFERENCE = {
  mode: "auto",
  providerId: "openrouter",
};

export function getProviderPreference() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCE };

    const parsed = JSON.parse(raw);
    return {
      mode: parsed?.mode === "manual" ? "manual" : "auto",
      providerId:
        typeof parsed?.providerId === "string" && parsed.providerId
          ? parsed.providerId
          : DEFAULT_PREFERENCE.providerId,
    };
  } catch {
    return { ...DEFAULT_PREFERENCE };
  }
}

export function saveProviderPreference(preference) {
  const normalized = {
    mode: preference?.mode === "manual" ? "manual" : "auto",
    providerId:
      typeof preference?.providerId === "string" && preference.providerId
        ? preference.providerId
        : DEFAULT_PREFERENCE.providerId,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function orderProvidersByPreference(providers, preference) {
  if (!Array.isArray(providers)) return [];
  if (preference?.mode !== "manual") return [...providers];

  const preferred = providers.find(
    (provider) => provider.id === preference.providerId
  );

  if (!preferred) return [...providers];

  return [preferred, ...providers.filter((provider) => provider.id !== preferred.id)];
}
