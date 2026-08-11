const STORAGE_KEY = "replyforge_usage_analytics_v1";

const EMPTY_COUNTS = {
  generate: 0,
  coach: 0,
  rewrite: 0,
  translate: 0,
  intent: 0,
  grammar: 0,
  humanize: 0,
  shorten: 0,
  expand: 0,
  followup: 0,
  email: 0,
};

function todayKey() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getTodayUsage() {
  const date = todayKey();
  const store = readStore();
  const saved = store[date] || {};

  return {
    date,
    counts: { ...EMPTY_COUNTS, ...(saved.counts || {}) },
    providers: { ...(saved.providers || {}) },
    total: Number(saved.total) || 0,
    updatedAt: saved.updatedAt || null,
  };
}

export function recordUsage(action, providerId = "") {
  const date = todayKey();
  const store = readStore();
  const current = getTodayUsage();

  const counts = { ...current.counts };
  counts[action] = (counts[action] || 0) + 1;

  const providers = { ...current.providers };
  if (providerId) {
    providers[providerId] = (providers[providerId] || 0) + 1;
  }

  const next = {
    date,
    counts,
    providers,
    total: current.total + 1,
    updatedAt: new Date().toISOString(),
  };

  store[date] = next;

  const trimmed = Object.fromEntries(
    Object.entries(store)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 31)
  );

  writeStore(trimmed);
  return next;
}
