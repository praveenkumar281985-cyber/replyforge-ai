const messageInput = document.getElementById("message");
const characterCount = document.getElementById("characterCount");
const readSelectionButton = document.getElementById("readSelection");
const generateButton = document.getElementById("generateButton");
const lengthSelect = document.getElementById("length");
const generationModeSelect = document.getElementById("generationMode");
const toneSelect = document.getElementById("tone");
const languageSelect = document.getElementById("language");
const usageText = document.getElementById("usageText");
const usageProgress = document.getElementById("usageProgress");
const usageResetText = document.getElementById("usageResetText");
const accountBadge = document.getElementById("accountBadge");
const authCard = document.getElementById("authCard");
const mainSignInButton = document.getElementById("mainSignInButton");
const mainAuthStatus = document.getElementById("mainAuthStatus");
const settingsSignInButton = document.getElementById("settingsSignInButton");
const settingsSignOutButton = document.getElementById("settingsSignOutButton");
const settingsAccountStatus = document.getElementById("settingsAccountStatus");
const settingsAuthMessage = document.getElementById("settingsAuthMessage");
const errorBox = document.getElementById("errorBox");
const platformName = document.getElementById(
  "platformName"
);
const platformBadge = document.getElementById(
  "platformBadge"
);
const workspaceBadge =
  document.getElementById(
    "workspaceBadge"
  );
const previewContextButton =
  document.getElementById(
    "previewContextButton"
  );
const contextSummary =
  document.getElementById(
    "contextSummary"
  );
const contextPreview =
  document.getElementById(
    "contextPreview"
  );
const contextPlatform =
  document.getElementById(
    "contextPlatform"
  );
const contextMessageCount =
  document.getElementById(
    "contextMessageCount"
  );
const contextPreviewText =
  document.getElementById(
    "contextPreviewText"
  );
const clearMessageButton =
  document.getElementById(
    "clearMessageButton"
  );
const clearAllButton =
  document.getElementById(
    "clearAllButton"
  );
const toggleHistoryButton =
  document.getElementById(
    "toggleHistoryButton"
  );
const clearHistoryButton =
  document.getElementById(
    "clearHistoryButton"
  );
const historyPanel =
  document.getElementById(
    "historyPanel"
  );
const historyEmptyState =
  document.getElementById(
    "historyEmptyState"
  );
const historyList =
  document.getElementById(
    "historyList"
  );
const openSettingsButton =
  document.getElementById(
    "openSettingsButton"
  );
const closeSettingsButton =
  document.getElementById(
    "closeSettingsButton"
  );
const settingsBackdrop =
  document.getElementById(
    "settingsBackdrop"
  );
const themeSetting =
  document.getElementById(
    "themeSetting"
  );
const defaultLengthSetting =
  document.getElementById(
    "defaultLengthSetting"
  );
const defaultModeSetting =
  document.getElementById(
    "defaultModeSetting"
  );
const saveHistorySetting =
  document.getElementById(
    "saveHistorySetting"
  );
const quickCommandsSetting =
  document.getElementById(
    "quickCommandsSetting"
  );
const motionSetting =
  document.getElementById(
    "motionSetting"
  );
const saveSettingsButton =
  document.getElementById(
    "saveSettingsButton"
  );
const resetSettingsButton =
  document.getElementById(
    "resetSettingsButton"
  );
const quickCommandHint =
  document.getElementById(
    "quickCommandHint"
  );
const templateButtons = document.getElementById("templateButtons");
const clearTemplateButton = document.getElementById("clearTemplateButton");
const selectedTemplateStatus = document.getElementById("selectedTemplateStatus");

function renderAuthState(signedIn, message = "", type = "") {
  authCard.hidden = signedIn;
  settingsSignInButton.hidden = signedIn;
  settingsSignOutButton.hidden = !signedIn;
  settingsAccountStatus.textContent = signedIn
    ? "Connected · Your web-app plan and daily allowance are active."
    : "Signed out · Connect the same Google account as the web app.";

  mainAuthStatus.textContent = message;
  mainAuthStatus.className = `rf-auth-status ${type}`;
  settingsAuthMessage.textContent = message;
  settingsAuthMessage.className = `rf-auth-status ${type}`;
}

function setAuthButtonsDisabled(disabled) {
  mainSignInButton.disabled = disabled;
  settingsSignInButton.disabled = disabled;
  settingsSignOutButton.disabled = disabled;
}

async function refreshAuthStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "AUTH_STATUS" });
    renderAuthState(Boolean(response?.success && response?.signedIn));
  } catch (error) {
    renderAuthState(false, error?.message || "Could not read sign-in status.", "error");
  }
}

async function signInFromPanel() {
  try {
    setAuthButtonsDisabled(true);
    renderAuthState(false, "Opening secure Google sign-in…", "loading");
    const response = await chrome.runtime.sendMessage({ type: "AUTH_SIGN_IN" });
    if (!response?.success) {
      throw new Error(response?.error || "Google sign-in failed.");
    }

    renderAuthState(true, "Signed in successfully.", "success");
    await refreshUsage();
  } catch (error) {
    renderAuthState(false, error?.message || "Google sign-in failed.", "error");
  } finally {
    setAuthButtonsDisabled(false);
  }
}

async function signOutFromPanel() {
  try {
    setAuthButtonsDisabled(true);
    const response = await chrome.runtime.sendMessage({ type: "AUTH_SIGN_OUT" });
    if (!response?.success) throw new Error(response?.error || "Sign out failed.");
    renderAuthState(false, "Signed out.", "success");
    await refreshUsage();
  } catch (error) {
    renderAuthState(true, error?.message || "Sign out failed.", "error");
  } finally {
    setAuthButtonsDisabled(false);
  }
}

async function refreshUsage() {
  try {
    const status = await chrome.runtime.sendMessage({ type: "GET_USAGE" });
    if (!status?.success || !status?.signedIn) {
      usageText.textContent = "Sign in to view usage";
      usageProgress.style.width = "0%";
      usageResetText.textContent = "Open settings to sign in with Google";
      accountBadge.textContent = "Signed out";
      accountBadge.className = "rf-account-badge signed-out";
      renderAuthState(false);
      return;
    }
    const used = Math.max(0, Number(status.used) || 0);
    const limit = Math.max(1, Number(status.limit) || 30);
    const remaining = Math.max(0, limit - used);
    usageText.textContent = `${remaining} of ${limit} replies remaining`;
    usageProgress.style.width = `${Math.min(100, (used / limit) * 100)}%`;
    usageProgress.classList.toggle("warning", remaining <= 5 && remaining > 0);
    usageProgress.classList.toggle("exhausted", remaining === 0);
    usageResetText.textContent = remaining === 0 ? "Daily limit reached — resets tomorrow" : `${used} used today · resets daily`;
    accountBadge.textContent = "Connected";
    accountBadge.className = "rf-account-badge connected";
    renderAuthState(true);
  } catch (error) {
    usageText.textContent = "Usage unavailable";
    usageResetText.textContent = "Generation still works; retry after reopening the panel";
    accountBadge.textContent = "Connected";
  }
}

const singleReplySection = document.getElementById("singleReplySection");
const singleReplyInput = document.getElementById("singleReply");
const singleCopyButton = document.getElementById("singleCopyButton");
const singleAnalyzeButton = document.getElementById(
  "singleAnalyzeButton"
);
const singleCoachPanel = document.getElementById(
  "singleCoachPanel"
);
const singleInsertButton = document.getElementById(
  "singleInsertButton"
);

const multipleRepliesSection = document.getElementById("multipleRepliesSection");
const replyCardsContainer = document.getElementById("replyCardsContainer");
const replyCountBadge = document.getElementById("replyCountBadge");

let generatedReplies = [];
let selectedTemplate = "";
let singleCoachAnalysis = null;
const coachAnalyses = new Map();

const SMART_TEMPLATES = {
  professional: {
    label: "Professional",
    instruction: "Write a polished, respectful and professional reply.",
  },
  friendly: {
    label: "Friendly",
    instruction: "Write a warm, natural and conversational reply.",
  },
  apology: {
    label: "Apology",
    instruction: "Write a sincere apology that takes appropriate responsibility and offers a constructive next step.",
  },
  approval: {
    label: "Approval",
    instruction: "Write a positive approval or acceptance reply and clearly confirm the next step.",
  },
  reject: {
    label: "Reject",
    instruction: "Write a respectful rejection or decline. Be clear, tactful and avoid sounding harsh.",
  },
  clarify: {
    label: "Clarify",
    instruction: "Ask for the missing information or clarification needed to proceed.",
  },
  followup: {
    label: "Follow-up",
    instruction: "Write a professional follow-up that politely asks for an update or response.",
  },
  escalate: {
    label: "Escalate",
    instruction: "Write a firm but professional escalation reply that clearly states the concern and requests prompt action.",
  },
  thankyou: {
    label: "Thank You",
    instruction: "Write a sincere and natural thank-you reply.",
  },
};

function updateTemplateUI() {
  templateButtons
    .querySelectorAll(".rf-template-button")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.template === selectedTemplate
      );
    });

  if (!selectedTemplate) {
    clearTemplateButton.hidden = true;
    selectedTemplateStatus.hidden = true;
    selectedTemplateStatus.textContent = "";
    return;
  }

  const template = SMART_TEMPLATES[selectedTemplate];
  clearTemplateButton.hidden = false;
  selectedTemplateStatus.hidden = false;
  selectedTemplateStatus.textContent = `${template.label} template selected.`;
}

function buildTemplateAwareMessage(message) {
  if (!selectedTemplate) return message;

  const template = SMART_TEMPLATES[selectedTemplate];
  if (!template) return message;

  return `Follow this reply instruction:
${template.instruction}

Reply to this incoming message:
${message}`;
}


const RF_LEGACY_STORAGE_KEY =
  "replyforge_popup_state_v253";
const RF_WORKSPACE_PREFIX =
  "replyforge_workspace_tab_";

let activeWorkspaceTabId = null;
let activeWorkspaceKey = null;
let workspaceSwitchSequence = 0;

function getWorkspaceStorageKey(
  tabId
) {
  return (
    `${RF_WORKSPACE_PREFIX}${tabId}`
  );
}

function updateWorkspaceBadge(tab) {
  if (!workspaceBadge) {
    return;
  }

  if (!tab?.id) {
    workspaceBadge.textContent =
      "No tab";
    return;
  }

  const shortTabId =
    String(tab.id).slice(-5);

  workspaceBadge.textContent =
    `Tab #${shortTabId}`;
}

const RF_HISTORY_KEY =
  "replyforge_reply_history_v210";
const RF_HISTORY_LIMIT = 20;

const RF_SETTINGS_KEY =
  "replyforge_settings_v320";

const DEFAULT_RF_SETTINGS = {
  theme: "system",
  defaultLength: "Medium",
  defaultMode: "multiple",
  saveHistory: true,
  quickCommands: true,
  motion: true,
};

let replyForgeSettings = {
  ...DEFAULT_RF_SETTINGS,
};

function resolveTheme(theme) {
  if (theme === "dark") {
    return "dark";
  }

  if (theme === "light") {
    return "light";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

function applyReplyForgeSettings() {
  document.documentElement.dataset.rfTheme =
    resolveTheme(
      replyForgeSettings.theme
    );

  document.documentElement.dataset.rfMotion =
    replyForgeSettings.motion
      ? "on"
      : "off";

  quickCommandHint.hidden =
    !replyForgeSettings.quickCommands;
}

function fillSettingsForm() {
  themeSetting.value =
    replyForgeSettings.theme;

  defaultLengthSetting.value =
    replyForgeSettings.defaultLength;

  defaultModeSetting.value =
    replyForgeSettings.defaultMode;

  saveHistorySetting.checked =
    replyForgeSettings.saveHistory;

  quickCommandsSetting.checked =
    replyForgeSettings.quickCommands;

  motionSetting.checked =
    replyForgeSettings.motion;
}

async function loadReplyForgeSettings() {
  const stored =
    await chrome.storage.local.get(
      RF_SETTINGS_KEY
    );

  replyForgeSettings = {
    ...DEFAULT_RF_SETTINGS,
    ...(
      stored?.[RF_SETTINGS_KEY] ||
      {}
    ),
  };

  applyReplyForgeSettings();
  fillSettingsForm();
}

async function persistReplyForgeSettings(
  nextSettings
) {
  replyForgeSettings = {
    ...DEFAULT_RF_SETTINGS,
    ...nextSettings,
  };

  await chrome.storage.local.set({
    [RF_SETTINGS_KEY]:
      replyForgeSettings,
  });

  applyReplyForgeSettings();
  fillSettingsForm();
}

function openSettingsDialog() {
  fillSettingsForm();
  settingsBackdrop.hidden = false;
  themeSetting.focus();
  refreshAuthStatus();
}

function closeSettingsDialog() {
  settingsBackdrop.hidden = true;
}

function getSettingsFromForm() {
  return {
    theme: themeSetting.value,
    defaultLength:
      defaultLengthSetting.value,
    defaultMode:
      defaultModeSetting.value,
    saveHistory:
      saveHistorySetting.checked,
    quickCommands:
      quickCommandsSetting.checked,
    motion:
      motionSetting.checked,
  };
}

const QUICK_COMMANDS = {
  short: {
    length: "Short",
  },
  long: {
    length: "Long",
  },
  formal: {
    template: "professional",
  },
  professional: {
    template: "professional",
  },
  friendly: {
    template: "friendly",
  },
  apology: {
    template: "apology",
  },
  firm: {
    template: "escalate",
  },
  escalate: {
    template: "escalate",
  },
  followup: {
    template: "followup",
  },
  clarify: {
    template: "clarify",
  },
  thankyou: {
    template: "thankyou",
  },
  approve: {
    template: "approval",
  },
  reject: {
    template: "reject",
  },
};

function applyQuickCommand(
  rawMessage
) {
  if (
    !replyForgeSettings
      .quickCommands
  ) {
    return rawMessage;
  }

  const match =
    rawMessage.match(
      /^\/([a-z]+)\s+/i
    );

  if (!match) {
    return rawMessage;
  }

  const command =
    match[1].toLowerCase();

  const config =
    QUICK_COMMANDS[command];

  if (!config) {
    return rawMessage;
  }

  if (config.length) {
    lengthSelect.value =
      config.length;
  }

  if (config.template) {
    selectedTemplate =
      config.template;
    updateTemplateUI();
  }

  const cleanMessage =
    rawMessage
      .slice(match[0].length)
      .trim();

  messageInput.value =
    cleanMessage;

  updateCharacterCount();
  schedulePopupStateSave();

  showToast(
    `/${command} command applied`
  );

  return cleanMessage;
}

function getLatestVisibleReply() {
  if (
    !singleReplySection.hidden &&
    singleReplyInput.value.trim()
  ) {
    return singleReplyInput.value.trim();
  }

  if (
    !multipleRepliesSection.hidden &&
    generatedReplies[0]?.reply
  ) {
    return generatedReplies[0].reply;
  }

  return "";
}

function getCurrentPlatformLabel() {
  return (
    platformName?.textContent?.trim() ||
    "Unknown"
  );
}

function createHistoryEntry({
  mode,
  replies,
}) {
  const cleanMessage =
    messageInput.value.trim();

  const normalizedReplies =
    Array.isArray(replies)
      ? replies
          .map((item) => ({
            title:
              item?.title ||
              "Reply",
            reply:
              item?.reply?.trim() ||
              "",
          }))
          .filter((item) => item.reply)
      : [];

  if (
    !cleanMessage ||
    !normalizedReplies.length
  ) {
    return null;
  }

  return {
    id:
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
    createdAt:
      new Date().toISOString(),
    platform:
      getCurrentPlatformLabel(),
    message:
      cleanMessage.slice(0, 5000),
    selectedTemplate,
    length:
      lengthSelect.value,
    mode,
    replies:
      normalizedReplies,
  };
}

async function readReplyHistory() {
  const stored =
    await chrome.storage.local.get(
      RF_HISTORY_KEY
    );

  return Array.isArray(
    stored?.[RF_HISTORY_KEY]
  )
    ? stored[RF_HISTORY_KEY]
    : [];
}

async function saveHistoryEntry(entry) {
  if (
    !entry ||
    !replyForgeSettings.saveHistory
  ) {
    return;
  }

  const current =
    await readReplyHistory();

  const next = [
    entry,
    ...current,
  ].slice(0, RF_HISTORY_LIMIT);

  await chrome.storage.local.set({
    [RF_HISTORY_KEY]: next,
  });

  if (!historyPanel.hidden) {
    renderReplyHistory(next);
  }
}

function formatHistoryTime(value) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  );
}

function getHistoryPreview(entry) {
  const firstReply =
    entry?.replies?.[0]?.reply ||
    "";

  return firstReply;
}

function renderReplyHistory(history) {
  const entries =
    Array.isArray(history)
      ? history
      : [];

  historyEmptyState.hidden =
    entries.length > 0;

  clearHistoryButton.hidden =
    entries.length === 0;

  historyList.innerHTML =
    entries
      .map((entry) => {
        const templateLabel =
          entry.selectedTemplate &&
          SMART_TEMPLATES[
            entry.selectedTemplate
          ]
            ? SMART_TEMPLATES[
                entry.selectedTemplate
              ].label
            : "No template";

        return `
          <article
            class="rf-history-item"
            data-history-id="${escapeHtml(
              entry.id
            )}"
          >
            <div class="rf-history-item-header">
              <div class="rf-history-meta">
                <span class="rf-history-chip">
                  ${escapeHtml(
                    entry.platform ||
                      "Unknown"
                  )}
                </span>
                <span class="rf-history-chip">
                  ${escapeHtml(
                    templateLabel
                  )}
                </span>
                <span class="rf-history-chip">
                  ${escapeHtml(
                    entry.mode ===
                      "single"
                      ? "Single"
                      : "4 Replies"
                  )}
                </span>
              </div>

              <span class="rf-history-time">
                ${escapeHtml(
                  formatHistoryTime(
                    entry.createdAt
                  )
                )}
              </span>
            </div>

            <p class="rf-history-message">
              ${escapeHtml(
                entry.message
                  .slice(0, 180)
              )}
            </p>

            <pre class="rf-history-reply">${escapeHtml(
              getHistoryPreview(entry)
            )}</pre>

            <div class="rf-history-actions">
              <button
                type="button"
                data-history-action="load"
                data-history-id="${escapeHtml(
                  entry.id
                )}"
              >
                Load
              </button>

              <button
                type="button"
                data-history-action="copy"
                data-history-id="${escapeHtml(
                  entry.id
                )}"
              >
                Copy reply
              </button>

              <button
                type="button"
                data-history-action="delete"
                data-history-id="${escapeHtml(
                  entry.id
                )}"
              >
                Delete
              </button>
            </div>
          </article>
        `;
      })
      .join("");
}

async function refreshReplyHistory() {
  const history =
    await readReplyHistory();

  renderReplyHistory(history);
}

function resetContextPreview() {
  contextSummary.textContent =
    "Not checked yet";

  contextPlatform.textContent =
    "Platform: —";

  contextMessageCount.textContent =
    "Messages: 0";

  contextPreviewText.textContent =
    "No conversation context detected.";

  contextPreview.hidden = true;

  previewContextButton.textContent =
    "Preview";
}

async function clearSavedWorkspace() {
  if (!activeWorkspaceKey) {
    return;
  }

  await chrome.storage.local.remove(
    activeWorkspaceKey
  );
}

async function clearMessageOnly() {
  messageInput.value = "";
  updateCharacterCount();
  schedulePopupStateSave();
  messageInput.focus();
  showToast("Message cleared");
}

async function startNewConversation() {
  const hasContent =
    Boolean(
      messageInput.value.trim() ||
      singleReplyInput.value.trim() ||
      generatedReplies.length
    );

  if (
    hasContent &&
    !window.confirm(
      "Clear the current message, replies and analysis?"
    )
  ) {
    return;
  }

  isRestoringPopupState = true;

  try {
    messageInput.value = "";
    selectedTemplate = "";
    generationModeSelect.value =
      "multiple";
    lengthSelect.value =
      "Medium";

    hideResults();
    clearError();
    resetContextPreview();
    updateCharacterCount();
    updateGenerateButtonText();
    updateTemplateUI();

    await clearSavedWorkspace();
  } finally {
    isRestoringPopupState = false;
  }

  messageInput.focus();
  showToast("New conversation started");
}

async function loadHistoryEntry(entry) {
  isRestoringPopupState = true;

  try {
    messageInput.value =
      entry.message || "";

    selectedTemplate =
      entry.selectedTemplate || "";

    generationModeSelect.value =
      entry.mode === "single"
        ? "single"
        : "multiple";

    lengthSelect.value =
      ["Short", "Medium", "Long"].includes(
        entry.length
      )
        ? entry.length
        : "Medium";

    hideResults();

    if (
      entry.mode === "single" &&
      entry.replies?.[0]?.reply
    ) {
      renderSingleReply(
        entry.replies[0].reply
      );
    } else if (
      Array.isArray(entry.replies) &&
      entry.replies.length
    ) {
      renderMultipleReplies(
        entry.replies
      );
    }

    updateCharacterCount();
    updateGenerateButtonText();
    updateTemplateUI();
  } finally {
    isRestoringPopupState = false;
  }

  schedulePopupStateSave();
  showToast("History item loaded");
}

let isRestoringPopupState = false;
let popupSaveTimer = null;

function getSerializableCoachAnalyses() {
  return [...coachAnalyses.entries()];
}

function createCurrentWorkspaceState() {
  return {
    message: messageInput.value,
    selectedTemplate,
    mode: generationModeSelect.value,
    length: lengthSelect.value,
    tone: toneSelect.value,
    language: languageSelect.value,
    singleReply: singleReplyInput.value,
    generatedReplies,
    singleCoachAnalysis,
    coachAnalyses:
      getSerializableCoachAnalyses(),
    activeResult:
      !multipleRepliesSection.hidden
        ? "multiple"
        : !singleReplySection.hidden
          ? "single"
          : "none",
    contextPreview: {
      summary:
        contextSummary.textContent,
      platform:
        contextPlatform.textContent,
      messageCount:
        contextMessageCount.textContent,
      text:
        contextPreviewText.textContent,
      isVisible:
        !contextPreview.hidden,
      buttonText:
        previewContextButton.textContent,
    },
    updatedAt:
      new Date().toISOString(),
  };
}

async function saveCurrentWorkspaceImmediately(
  storageKey = activeWorkspaceKey
) {
  if (
    isRestoringPopupState ||
    !storageKey
  ) {
    return;
  }

  await chrome.storage.local.set({
    [storageKey]:
      createCurrentWorkspaceState(),
  });
}

function schedulePopupStateSave() {
  if (
    isRestoringPopupState ||
    !activeWorkspaceKey
  ) {
    return;
  }

  const storageKey =
    activeWorkspaceKey;

  window.clearTimeout(
    popupSaveTimer
  );

  popupSaveTimer =
    window.setTimeout(() => {
      saveCurrentWorkspaceImmediately(
        storageKey
      ).catch((error) => {
        console.error(
          "ReplyForge workspace save error:",
          error
        );
      });
    }, 120);
}

function resetWorkspaceUI() {
  messageInput.value = "";
  selectedTemplate = "";
  generationModeSelect.value =
    replyForgeSettings.defaultMode;
  lengthSelect.value =
    replyForgeSettings.defaultLength;

  hideResults();
  clearError();
  resetContextPreview();
  updateCharacterCount();
  updateGenerateButtonText();
  updateTemplateUI();
}

function applyWorkspaceState(state) {
  messageInput.value =
    typeof state?.message === "string"
      ? state.message
      : "";

  selectedTemplate =
    typeof state?.selectedTemplate ===
      "string"
      ? state.selectedTemplate
      : "";

  generationModeSelect.value =
    state?.mode === "single"
      ? "single"
      : "multiple";

  lengthSelect.value =
    ["Short", "Medium", "Long"].includes(
      state?.length
    )
      ? state.length
      : "Medium";

  toneSelect.value = ["Professional", "Friendly", "Assertive", "Empathetic"].includes(state?.tone)
    ? state.tone
    : "Professional";
  languageSelect.value = ["Auto", "English", "Hindi", "Hinglish"].includes(state?.language)
    ? state.language
    : "Auto";

  generatedReplies =
    Array.isArray(
      state?.generatedReplies
    )
      ? state.generatedReplies
      : [];

  singleCoachAnalysis =
    state?.singleCoachAnalysis ||
    null;

  coachAnalyses.clear();

  if (
    Array.isArray(
      state?.coachAnalyses
    )
  ) {
    state.coachAnalyses.forEach(
      ([index, analysis]) => {
        coachAnalyses.set(
          Number(index),
          analysis
        );
      }
    );
  }

  hideResults();

  /*
   * hideResults clears generatedReplies, so restore it
   * before rendering the saved result.
   */
  generatedReplies =
    Array.isArray(
      state?.generatedReplies
    )
      ? state.generatedReplies
      : [];

  singleCoachAnalysis =
    state?.singleCoachAnalysis ||
    null;

  coachAnalyses.clear();

  if (
    Array.isArray(
      state?.coachAnalyses
    )
  ) {
    state.coachAnalyses.forEach(
      ([index, analysis]) => {
        coachAnalyses.set(
          Number(index),
          analysis
        );
      }
    );
  }

  updateCharacterCount();
  updateGenerateButtonText();
  updateTemplateUI();

  if (
    state?.activeResult ===
      "single" &&
    typeof state?.singleReply ===
      "string" &&
    state.singleReply.trim()
  ) {
    renderSingleReply(
      state.singleReply
    );
  } else if (
    state?.activeResult ===
      "multiple" &&
    generatedReplies.length
  ) {
    renderMultipleReplies(
      generatedReplies
    );
  }

  const preview =
    state?.contextPreview;

  if (preview) {
    contextSummary.textContent =
      preview.summary ||
      "Not checked yet";

    contextPlatform.textContent =
      preview.platform ||
      "Platform: —";

    contextMessageCount.textContent =
      preview.messageCount ||
      "Messages: 0";

    contextPreviewText.textContent =
      preview.text ||
      "No conversation context detected.";

    contextPreview.hidden =
      !preview.isVisible;

    previewContextButton.textContent =
      preview.buttonText ||
      "Preview";
  }
}

async function migrateLegacyWorkspace(
  storageKey
) {
  if (!storageKey) {
    return null;
  }

  const stored =
    await chrome.storage.local.get([
      storageKey,
      RF_LEGACY_STORAGE_KEY,
    ]);

  if (stored?.[storageKey]) {
    return stored[storageKey];
  }

  const legacyState =
    stored?.[
      RF_LEGACY_STORAGE_KEY
    ];

  if (!legacyState) {
    return null;
  }

  await chrome.storage.local.set({
    [storageKey]: legacyState,
  });

  await chrome.storage.local.remove(
    RF_LEGACY_STORAGE_KEY
  );

  return legacyState;
}

async function switchWorkspaceToTab(
  tab
) {
  if (!tab?.id) {
    return;
  }

  const sequence =
    ++workspaceSwitchSequence;

  window.clearTimeout(
    popupSaveTimer
  );

  const previousKey =
    activeWorkspaceKey;

  if (previousKey) {
    await saveCurrentWorkspaceImmediately(
      previousKey
    );
  }

  if (
    sequence !==
    workspaceSwitchSequence
  ) {
    return;
  }

  activeWorkspaceTabId = tab.id;
  activeWorkspaceKey =
    getWorkspaceStorageKey(
      tab.id
    );

  updateWorkspaceBadge(tab);

  isRestoringPopupState = true;

  try {
    resetWorkspaceUI();

    const state =
      await migrateLegacyWorkspace(
        activeWorkspaceKey
      );

    if (
      sequence !==
      workspaceSwitchSequence
    ) {
      return;
    }

    if (state) {
      applyWorkspaceState(state);
    }
  } catch (error) {
    console.error(
      "ReplyForge workspace restore error:",
      error
    );
  } finally {
    if (
      sequence ===
      workspaceSwitchSequence
    ) {
      isRestoringPopupState =
        false;
    }
  }
}

async function restorePopupState() {
  const tab =
    await getActiveTab();

  await switchWorkspaceToTab(
    tab
  );
}

function updateCharacterCount() {
  characterCount.textContent = `${messageInput.value.length}/5000`;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  errorBox.textContent = "";
  errorBox.hidden = true;
}


function getToastElement() {
  let toast = document.getElementById("rfToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "rfToast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    Object.assign(toast.style, {
      position: "fixed",
      left: "50%",
      bottom: "14px",
      zIndex: "9999",
      maxWidth: "calc(100% - 28px)",
      transform: "translate(-50%, 14px)",
      border: "1px solid rgba(124, 58, 237, 0.18)",
      borderRadius: "10px",
      background: "rgba(24, 32, 51, 0.94)",
      boxShadow: "0 12px 28px rgba(17, 24, 39, 0.24)",
      padding: "9px 12px",
      color: "#ffffff",
      fontSize: "9px",
      fontWeight: "800",
      lineHeight: "1.4",
      opacity: "0",
      pointerEvents: "none",
      transition:
        "opacity 0.18s ease, transform 0.18s ease",
    });

    document.body.appendChild(toast);
  }

  return toast;
}

let toastTimer = null;

function showToast(message) {
  const toast = getToastElement();

  toast.textContent = message;
  toast.style.opacity = "1";
  toast.style.transform = "translate(-50%, 0)";

  window.clearTimeout(toastTimer);

  toastTimer = window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%, 14px)";
  }, 1600);
}

function setTemplateControlsDisabled(isDisabled) {
  templateButtons
    .querySelectorAll(".rf-template-button")
    .forEach((button) => {
      button.disabled = isDisabled;
    });

  clearTemplateButton.disabled = isDisabled;
}

function hideResults() {
  singleReplySection.hidden = true;
  multipleRepliesSection.hidden = true;
  singleReplyInput.value = "";
  singleCoachPanel.innerHTML = "";
  singleCoachPanel.hidden = true;
  replyCardsContainer.innerHTML = "";
  generatedReplies = [];
  singleCoachAnalysis = null;
  coachAnalyses.clear();
}

function updateGenerateButtonText() {
  generateButton.textContent =
    generationModeSelect.value === "multiple"
      ? "Generate Suggestions"
      : "Generate Reply";
}

function setLoading(isLoading) {
  generateButton.disabled = isLoading;
  readSelectionButton.disabled = isLoading;
  generationModeSelect.disabled = isLoading;
  lengthSelect.disabled = isLoading;
  setTemplateControlsDisabled(isLoading);

  generateButton.textContent = isLoading
    ? generationModeSelect.value === "multiple"
      ? "ReplyForge is creating 4 suggestions..."
      : "ReplyForge is writing your reply..."
    : generationModeSelect.value === "multiple"
      ? "Generate Suggestions"
      : "Generate Reply";
}

function renderConversationContext(
  context
) {
  const messages =
    Array.isArray(context?.messages)
      ? context.messages
      : [];

  const platform =
    context?.platform ||
    "unknown";

  contextSummary.textContent =
    messages.length
      ? `${messages.length} messages detected`
      : "No messages detected";

  contextPlatform.textContent =
    `Platform: ${platform}`;

  contextMessageCount.textContent =
    `Messages: ${messages.length}`;

  contextPreviewText.textContent =
    context?.fullContext?.trim() ||
    "No conversation context detected.";

  contextPreview.hidden = true;
  previewContextButton.textContent =
    "View";
}

async function previewConversationContext() {
  const originalText =
    previewContextButton.textContent;

  try {
    previewContextButton.disabled = true;
    previewContextButton.textContent =
      "Checking...";

    const response =
      await sendMessageToActiveTab({
        type:
          "GET_CONVERSATION_CONTEXT",
      });

    if (!response?.success) {
      throw new Error(
        response?.error ||
          "Conversation context could not be read."
      );
    }

    renderConversationContext(
      response.context || {}
    );

    previewContextButton.textContent =
      "Refresh";
  } catch (error) {
    console.error(error);

    contextSummary.textContent =
      "Context check failed";

    contextPreviewText.textContent =
      error?.message ||
      "Conversation context could not be read.";

    contextPreview.hidden = false;
    previewContextButton.textContent =
      originalText;
  } finally {
    previewContextButton.disabled = false;
  }
}

function detectPlatformFromUrl(url) {
  let hostname;

  try {
    hostname = new URL(url || "").hostname;
  } catch {
    hostname = "";
  }

  if (hostname === "mail.google.com") {
    return {
      key: "gmail",
      name: "Gmail",
      supported: true,
    };
  }

  if (hostname === "web.whatsapp.com") {
    return {
      key: "whatsapp",
      name: "WhatsApp Web",
      supported: true,
    };
  }

  if (
    hostname === "www.linkedin.com" ||
    hostname.endsWith(".linkedin.com")
  ) {
    return {
      key: "linkedin",
      name: "LinkedIn",
      supported: true,
    };
  }

  if (
    hostname === "outlook.live.com" ||
    hostname === "outlook.office.com" ||
    hostname === "outlook.office365.com"
  ) {
    return {
      key: "outlook",
      name: "Outlook Web",
      supported: true,
    };
  }

  return {
    key: "unknown",
    name: hostname || "Unsupported page",
    supported: false,
  };
}

function renderPlatform(platform) {
  platformName.textContent = platform.name;

  platformBadge.className =
    `rf-platform-badge ${platform.key}`;

  platformBadge.textContent =
    platform.supported
      ? "Supported"
      : "Unknown";
}

async function refreshPlatformDetection() {
  try {
    const tab = await getActiveTab();

    if (
      tab?.id &&
      tab.id !==
        activeWorkspaceTabId
    ) {
      await switchWorkspaceToTab(
        tab
      );
    }

    const platform =
      detectPlatformFromUrl(tab?.url);

    renderPlatform(platform);
  } catch (error) {
    console.error(
      "ReplyForge platform detection failed:",
      error
    );

    renderPlatform({
      key: "unknown",
      name: "Detection failed",
      supported: false,
    });
  }
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tabs[0];
}

async function sendMessageToActiveTab(payload) {
  const tab = await getActiveTab();

  if (!tab?.id) {
    throw new Error("No active browser tab was found.");
  }

  return chrome.tabs.sendMessage(tab.id, payload);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createRewriteButtons(index) {
  const options = [
    ["friendly", "Friendly"],
    ["professional", "Professional"],
    ["assertive", "Assertive"],
    ["empathetic", "Empathetic"],
    ["shorter", "Shorter"],
    ["longer", "Longer"],
    ["polite", "More Polite"],
    ["email", "Email Style"],
    ["legal", "Legal Style"],
  ];

  return options
    .map(
      ([action, label]) => `
        <button
          type="button"
          class="rf-rewrite-button"
          data-action="rewrite"
          data-rewrite-action="${action}"
          data-index="${index}"
        >
          ${label}
        </button>
      `
    )
    .join("");
}

function createReplyCard(replyItem, index) {
  const title = replyItem?.title || `Reply ${index + 1}`;
  const reply = replyItem?.reply || "";

  return `
    <article class="rf-card" data-index="${index}">
      <div class="rf-card-header">
        <div>
          <div class="rf-title">${escapeHtml(title)}</div>
          <div class="rf-card-subtitle">Suggestion ${index + 1}</div>
        </div>

        <div class="rf-card-actions">
          <button
            type="button"
            class="rf-analyze"
            data-action="analyze"
            data-index="${index}"
          >
            Analyze
          </button>

          <button
            type="button"
            class="rf-copy"
            data-action="copy"
            data-index="${index}"
          >
            Copy
          </button>
        </div>
      </div>

      <textarea
        readonly
        class="rf-reply"
        data-reply-index="${index}"
      >${escapeHtml(reply)}</textarea>

      <div
        class="rf-coach-panel"
        data-coach-index="${index}"
        hidden
      ></div>

      <div class="rf-rewrite-toolbar">
        <span class="rf-rewrite-label">Rewrite as</span>
        <div class="rf-rewrite-options">
          ${createRewriteButtons(index)}
        </div>
      </div>

      <button
        type="button"
        class="secondary-button full-width"
        data-action="insert"
        data-index="${index}"
      >
        Insert into page
      </button>
    </article>
  `;
}

function renderMultipleReplies(replies) {
  generatedReplies = Array.isArray(replies) ? replies : [];

  if (!generatedReplies.length) {
    throw new Error("No reply suggestions were returned.");
  }

  replyCardsContainer.innerHTML = generatedReplies
    .map((replyItem, index) => createReplyCard(replyItem, index))
    .join("");

  replyCountBadge.textContent = `${generatedReplies.length} replies`;
  singleReplySection.hidden = true;
  multipleRepliesSection.hidden = false;
}

function renderSingleReply(reply) {
  const cleanReply = reply?.trim();

  if (!cleanReply) {
    throw new Error("The AI returned an empty reply.");
  }

  singleReplyInput.value = cleanReply;
  multipleRepliesSection.hidden = true;
  singleReplySection.hidden = false;
}

function getCoachMetricLabel(key) {
  const labels = {
    grammar: "Grammar",
    clarity: "Clarity",
    professionalism: "Professionalism",
    politeness: "Politeness",
    confidence: "Confidence",
    empathy: "Empathy",
    readability: "Readability",
    callToAction: "Call to action",
    aggressiveRisk: "Aggressive risk",
    misunderstandingRisk: "Misunderstanding risk",
  };

  return labels[key] || key;
}

function renderCoachPanel(panel, analysis) {
  const standardMetrics = [
    "grammar",
    "clarity",
    "professionalism",
    "politeness",
    "confidence",
    "empathy",
    "readability",
    "callToAction",
  ];

  const riskMetrics = [
    "aggressiveRisk",
    "misunderstandingRisk",
  ];

  const metricsHtml = standardMetrics
    .map((key) => {
      const score = Number(analysis?.[key]) || 0;

      return `
        <div class="rf-coach-metric">
          <div class="rf-coach-metric-heading">
            <span>${getCoachMetricLabel(key)}</span>
            <strong>${score}</strong>
          </div>

          <div class="rf-coach-track">
            <div
              class="rf-coach-fill"
              style="width:${Math.max(0, Math.min(100, score))}%"
            ></div>
          </div>
        </div>
      `;
    })
    .join("");

  const risksHtml = riskMetrics
    .map((key) => {
      const score = Number(analysis?.[key]) || 0;
      const riskClass =
        score <= 20
          ? "low"
          : score <= 50
            ? "medium"
            : "high";

      return `
        <div class="rf-risk-item ${riskClass}">
          <span>${getCoachMetricLabel(key)}</span>
          <strong>${score}</strong>
        </div>
      `;
    })
    .join("");

  const suggestions = Array.isArray(
    analysis?.suggestions
  )
    ? analysis.suggestions
    : [];

  const suggestionsHtml = suggestions
    .map(
      (suggestion) =>
        `<li>${escapeHtml(suggestion)}</li>`
    )
    .join("");

  panel.innerHTML = `
    <div class="rf-coach-top">
      <div class="rf-coach-score">
        <strong>${Number(analysis?.overall) || 0}</strong>
        <span>/100</span>
      </div>

      <div>
        <div class="rf-coach-title">AI Reply Coach</div>
        <p>${escapeHtml(
          analysis?.verdict ||
            "Analysis completed."
        )}</p>
      </div>
    </div>

    <div class="rf-coach-metrics">
      ${metricsHtml}
    </div>

    <div class="rf-risk-grid">
      ${risksHtml}
    </div>

    ${
      suggestionsHtml
        ? `
          <div class="rf-coach-suggestions">
            <strong>Suggestions</strong>
            <ul>${suggestionsHtml}</ul>
          </div>
        `
        : ""
    }

    <button
      type="button"
      class="primary-button rf-improve-button"
      data-action="improve"
    >
      Improve Reply
    </button>
  `;

  panel.hidden = false;
}

async function analyzeReplyText(
  reply,
  button,
  panel,
  onAnalyzed
) {
  const cleanReply = reply?.trim();

  if (!cleanReply) {
    showError("No reply is available for analysis.");
    return;
  }

  const originalText = button.textContent;

  try {
    clearError();
    button.disabled = true;
    button.textContent = "Analyzing...";

    const response =
      await sendMessageToActiveTab({
        type: "ANALYZE_REPLY",
        reply: cleanReply,
      });

    if (!response?.success) {
      throw new Error(
        response?.error ||
          "Reply could not be analyzed."
      );
    }

    const analysis =
      response.analysis || {};

    renderCoachPanel(
      panel,
      analysis
    );

    if (typeof onAnalyzed === "function") {
      onAnalyzed(analysis);
    }

    button.textContent = "Analyzed";
    showToast("AI Coach analysis is ready");
  } catch (error) {
    console.error(error);

    showError(
      error?.message ||
        "Reply could not be analyzed."
    );

    button.textContent = originalText;
  } finally {
    button.disabled = false;

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1400);
  }
}

async function improveReplyText({
  reply,
  analysis,
  button,
  onImproved,
}) {
  const cleanReply = reply?.trim();

  if (!cleanReply) {
    showError(
      "No reply is available for improvement."
    );
    return;
  }

  const originalText = button.textContent;

  try {
    clearError();
    button.disabled = true;
    button.textContent = "Improving...";

    const response =
      await sendMessageToActiveTab({
        type: "IMPROVE_REPLY",
        reply: cleanReply,
        analysis: analysis || {},
      });

    if (!response?.success) {
      throw new Error(
        response?.error ||
          "Reply could not be improved."
      );
    }

    const improvedReply =
      response.reply?.trim();

    if (!improvedReply) {
      throw new Error(
        "AI returned an empty improved reply."
      );
    }

    onImproved(improvedReply);
    button.textContent = "Improved";
    showToast("Reply improved successfully");
  } catch (error) {
    console.error(error);

    showError(
      error?.message ||
        "Reply could not be improved."
    );

    button.textContent = originalText;
  } finally {
    button.disabled = false;

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1400);
  }
}

async function copyText(text, button) {
  const cleanText = text?.trim();
  if (!cleanText) return;

  try {
    await navigator.clipboard.writeText(cleanText);
    const originalText = button.textContent;
    button.textContent = "Copied";

    showToast("Reply copied");

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1400);
  } catch {
    showError("Reply could not be copied.");
  }
}

async function insertReplyIntoPage(reply, button) {
  const cleanReply = reply?.trim();

  if (!cleanReply) {
    showError("No reply is available.");
    return;
  }

  try {
    clearError();

    const response = await sendMessageToActiveTab({
      type: "INSERT_REPLY",
      reply: cleanReply,
    });

    if (!response?.success) {
      throw new Error(response?.error || "Reply could not be inserted.");
    }

    const originalText = button.textContent;
    button.textContent = "Inserted";

    showToast("Reply inserted into the page");

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1400);
  } catch (error) {
    console.error(error);
    showError(error?.message || "Reply could not be inserted into this page.");
  }
}

async function rewriteReply(index, rewriteAction, button) {
  const replyItem = generatedReplies[index];

  if (!replyItem?.reply) {
    showError("This reply suggestion is unavailable.");
    return;
  }

  const card = replyCardsContainer.querySelector(
    `.rf-card[data-index="${index}"]`
  );
  const textarea = card?.querySelector(
    `textarea[data-reply-index="${index}"]`
  );
  const buttons = card?.querySelectorAll("button");

  try {
    clearError();

    buttons?.forEach((item) => {
      item.disabled = true;
    });

    const originalText = button.textContent;
    button.textContent = "Rewriting...";

    const response = await sendMessageToActiveTab({
      type: "REWRITE_REPLY",
      reply: replyItem.reply,
      rewriteAction,
    });

    if (!response?.success) {
      throw new Error(response?.error || "Reply could not be rewritten.");
    }

    const rewrittenReply = response.reply?.trim();

    if (!rewrittenReply) {
      throw new Error("The AI returned an empty rewritten reply.");
    }

    generatedReplies[index] = {
      ...replyItem,
      reply: rewrittenReply,
      title: response.title || replyItem.title,
    };

    if (textarea) {
      textarea.value = rewrittenReply;
    }

    button.textContent = "Done";
    schedulePopupStateSave();
    showToast("Reply rewritten successfully");

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1100);
  } catch (error) {
    console.error(error);
    showError(error?.message || "Reply could not be rewritten.");
  } finally {
    buttons?.forEach((item) => {
      item.disabled = false;
    });
  }
}

previewContextButton.addEventListener(
  "click",
  async () => {
    if (
      contextPreviewText.textContent !==
        "No conversation context detected." &&
      contextPreviewText.textContent.trim()
    ) {
      contextPreview.hidden =
        !contextPreview.hidden;

      previewContextButton.textContent =
        contextPreview.hidden
          ? "View"
          : "Hide";

      return;
    }

    await previewConversationContext();
  }
);

openSettingsButton.addEventListener(
  "click",
  openSettingsDialog
);

mainSignInButton.addEventListener("click", signInFromPanel);
settingsSignInButton.addEventListener("click", signInFromPanel);
settingsSignOutButton.addEventListener("click", signOutFromPanel);

closeSettingsButton.addEventListener(
  "click",
  closeSettingsDialog
);

settingsBackdrop.addEventListener(
  "click",
  (event) => {
    if (
      event.target ===
      settingsBackdrop
    ) {
      closeSettingsDialog();
    }
  }
);

saveSettingsButton.addEventListener(
  "click",
  async () => {
    await persistReplyForgeSettings(
      getSettingsFromForm()
    );

    closeSettingsDialog();
    showToast("Settings saved");
  }
);

resetSettingsButton.addEventListener(
  "click",
  async () => {
    await persistReplyForgeSettings(
      DEFAULT_RF_SETTINGS
    );

    showToast(
      "Default settings restored"
    );
  }
);

clearMessageButton.addEventListener(
  "click",
  clearMessageOnly
);

clearAllButton.addEventListener(
  "click",
  startNewConversation
);

toggleHistoryButton.addEventListener(
  "click",
  async () => {
    historyPanel.hidden =
      !historyPanel.hidden;

    toggleHistoryButton.textContent =
      historyPanel.hidden
        ? "View history"
        : "Hide history";

    if (!historyPanel.hidden) {
      await refreshReplyHistory();
    }
  }
);

clearHistoryButton.addEventListener(
  "click",
  async () => {
    if (
      !window.confirm(
        "Delete all saved ReplyForge history from this browser?"
      )
    ) {
      return;
    }

    await chrome.storage.local.remove(
      RF_HISTORY_KEY
    );

    renderReplyHistory([]);
    showToast("History cleared");
  }
);

historyList.addEventListener(
  "click",
  async (event) => {
    const button =
      event.target.closest(
        "button[data-history-action]"
      );

    if (!button) {
      return;
    }

    const history =
      await readReplyHistory();

    const entry =
      history.find(
        (item) =>
          item.id ===
          button.dataset.historyId
      );

    if (!entry) {
      showError(
        "This history item is unavailable."
      );
      return;
    }

    const action =
      button.dataset.historyAction;

    if (action === "load") {
      await loadHistoryEntry(entry);
      return;
    }

    if (action === "copy") {
      const reply =
        getHistoryPreview(entry);

      if (!reply) {
        showError(
          "This history item has no reply."
        );
        return;
      }

      await navigator.clipboard.writeText(
        reply
      );

      showToast("History reply copied");
      return;
    }

    if (action === "delete") {
      const next =
        history.filter(
          (item) =>
            item.id !== entry.id
        );

      await chrome.storage.local.set({
        [RF_HISTORY_KEY]: next,
      });

      renderReplyHistory(next);
      showToast("History item deleted");
    }
  }
);

templateButtons.addEventListener("click", (event) => {
  const button = event.target.closest(".rf-template-button");
  if (!button) return;

  const templateKey = button.dataset.template;
  if (!SMART_TEMPLATES[templateKey]) return;

  selectedTemplate =
    selectedTemplate === templateKey ? "" : templateKey;

  updateTemplateUI();
  schedulePopupStateSave();

  showToast(
    selectedTemplate
      ? `${SMART_TEMPLATES[selectedTemplate].label} template selected`
      : "Template cleared"
  );
});

clearTemplateButton.addEventListener("click", () => {
  selectedTemplate = "";
  updateTemplateUI();
  schedulePopupStateSave();
  showToast("Template cleared");
});

messageInput.addEventListener("input", () => {
  if (messageInput.value.length > 5000) {
    messageInput.value = messageInput.value.slice(0, 5000);
  }

  updateCharacterCount();
  schedulePopupStateSave();
});

generationModeSelect.addEventListener("change", () => {
  hideResults();
  clearError();
  updateGenerateButtonText();
  schedulePopupStateSave();
});


lengthSelect.addEventListener(
  "change",
  schedulePopupStateSave
);

toneSelect.addEventListener("change", schedulePopupStateSave);
languageSelect.addEventListener("change", schedulePopupStateSave);

readSelectionButton.addEventListener("click", async () => {
  try {
    clearError();

    const response = await sendMessageToActiveTab({
      type: "GET_SELECTED_TEXT",
    });

    const selectedText = response?.text?.trim() || "";

    if (!selectedText) {
      throw new Error("No text is selected on the current page.");
    }

    messageInput.value = selectedText.slice(0, 5000);
    updateCharacterCount();
    schedulePopupStateSave();
    showToast("Selected text added");
  } catch (error) {
    console.error(error);
    showError(error?.message || "Selected text could not be read.");
  }
});

generateButton.addEventListener("click", async () => {
  const initialMessage =
    messageInput.value.trim();

  const rawMessage =
    applyQuickCommand(
      initialMessage
    );

  const message =
    buildTemplateAwareMessage(
      rawMessage
    );

  if (!rawMessage) {
    showError("Select or paste an incoming message first.");
    return;
  }

  try {
    clearError();
    hideResults();
    setLoading(true);

    const isMultiple = generationModeSelect.value === "multiple";

    const response = await sendMessageToActiveTab({
      type: isMultiple
        ? "GENERATE_MULTIPLE_REPLIES"
        : "GENERATE_REPLY",
      message,
      tone: toneSelect.value,
      length: lengthSelect.value,
      language: languageSelect.value,
    });

    if (!response?.success) {
      throw new Error(response?.error || "Reply could not be generated.");
    }

    if (isMultiple) {
      renderMultipleReplies(response.replies);
      schedulePopupStateSave();

      await saveHistoryEntry(
        createHistoryEntry({
          mode: "multiple",
          replies: response.replies,
        })
      );

      showToast("4 reply suggestions are ready");
    } else {
      renderSingleReply(response.reply);
      schedulePopupStateSave();

      await saveHistoryEntry(
        createHistoryEntry({
          mode: "single",
          replies: [
            {
              title:
                "Generated reply",
              reply:
                response.reply,
            },
          ],
        })
      );

      showToast("Your reply is ready");
    }
    await refreshUsage();
  } catch (error) {
    console.error(error);
    showError(error?.message || "Unable to generate a reply.");
  } finally {
    setLoading(false);
  }
});

refreshUsage();

singleAnalyzeButton.addEventListener(
  "click",
  () => {
    analyzeReplyText(
      singleReplyInput.value,
      singleAnalyzeButton,
      singleCoachPanel,
      (analysis) => {
        singleCoachAnalysis = analysis;
        schedulePopupStateSave();
      }
    );
  }
);

singleCoachPanel.addEventListener(
  "click",
  (event) => {
    const button = event.target.closest(
      'button[data-action="improve"]'
    );

    if (!button) {
      return;
    }

    improveReplyText({
      reply: singleReplyInput.value,
      analysis: singleCoachAnalysis,
      button,
      onImproved: (improvedReply) => {
        singleReplyInput.value =
          improvedReply;

        singleCoachPanel.innerHTML = "";
        singleCoachPanel.hidden = true;
        singleCoachAnalysis = null;
        schedulePopupStateSave();
      },
    });
  }
);

singleCopyButton.addEventListener("click", () => {
  copyText(singleReplyInput.value, singleCopyButton);
});

singleInsertButton.addEventListener("click", () => {
  insertReplyIntoPage(singleReplyInput.value, singleInsertButton);
});

replyCardsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const replyItem = generatedReplies[index];

  if (!replyItem?.reply) {
    showError("This reply suggestion is unavailable.");
    return;
  }

  if (button.dataset.action === "improve") {
    const panel =
      replyCardsContainer.querySelector(
        `[data-coach-index="${index}"]`
      );

    const textarea =
      replyCardsContainer.querySelector(
        `textarea[data-reply-index="${index}"]`
      );

    improveReplyText({
      reply: replyItem.reply,
      analysis:
        coachAnalyses.get(index) || {},
      button,
      onImproved: (improvedReply) => {
        generatedReplies[index] = {
          ...replyItem,
          reply: improvedReply,
          title: "Improved",
        };

        if (textarea) {
          textarea.value = improvedReply;
        }

        if (panel) {
          panel.innerHTML = "";
          panel.hidden = true;
        }

        coachAnalyses.delete(index);
        schedulePopupStateSave();
      },
    });

    return;
  }

  if (button.dataset.action === "analyze") {
    const panel =
      replyCardsContainer.querySelector(
        `[data-coach-index="${index}"]`
      );

    if (!panel) {
      showError(
        "AI Coach panel could not be opened."
      );
      return;
    }

    analyzeReplyText(
      replyItem.reply,
      button,
      panel,
      (analysis) => {
        coachAnalyses.set(index, analysis);
        schedulePopupStateSave();
      }
    );
    return;
  }

  if (button.dataset.action === "copy") {
    copyText(replyItem.reply, button);
    return;
  }

  if (button.dataset.action === "insert") {
    insertReplyIntoPage(replyItem.reply, button);
    return;
  }

  if (button.dataset.action === "rewrite") {
    rewriteReply(index, button.dataset.rewriteAction, button);
  }
});

document.addEventListener("keydown", async (event) => {
  const commandKey =
    event.ctrlKey ||
    event.metaKey;

  if (
    commandKey &&
    event.key === "Enter"
  ) {
    event.preventDefault();

    if (!generateButton.disabled) {
      generateButton.click();
    }

    return;
  }

  if (
    commandKey &&
    event.shiftKey &&
    event.key.toLowerCase() ===
      "c"
  ) {
    const latestReply =
      getLatestVisibleReply();

    if (!latestReply) {
      return;
    }

    event.preventDefault();

    await navigator.clipboard.writeText(
      latestReply
    );

    showToast(
      "Latest reply copied"
    );

    return;
  }

  if (
    event.altKey &&
    event.key.toLowerCase() ===
      "n"
  ) {
    event.preventDefault();
    await startNewConversation();
    return;
  }

  if (
    event.key === "Escape" &&
    !settingsBackdrop.hidden
  ) {
    event.preventDefault();
    closeSettingsDialog();
  }
});

updateCharacterCount();
updateGenerateButtonText();
updateTemplateUI();

loadReplyForgeSettings()
  .then(restorePopupState)
  .then(refreshPlatformDetection)
  .catch((error) => {
    console.error(
      "ReplyForge startup error:",
      error
    );
  });


chrome.tabs.onActivated.addListener(
  async ({ tabId }) => {
    try {
      const tab =
        await chrome.tabs.get(
          tabId
        );

      await switchWorkspaceToTab(
        tab
      );

      renderPlatform(
        detectPlatformFromUrl(
          tab?.url
        )
      );
    } catch (error) {
      console.error(
        "ReplyForge tab workspace switch failed:",
        error
      );
    }
  }
);

chrome.tabs.onUpdated.addListener(
  async (
    tabId,
    changeInfo,
    tab
  ) => {
    if (
      tabId !==
        activeWorkspaceTabId
    ) {
      return;
    }

    if (
      changeInfo.status ===
        "complete" ||
      changeInfo.url
    ) {
      renderPlatform(
        detectPlatformFromUrl(
          tab?.url
        )
      );
    }
  }
);

chrome.tabs.onRemoved.addListener(
  (tabId) => {
    chrome.storage.local.remove(
      getWorkspaceStorageKey(
        tabId
      )
    );

    if (
      tabId ===
      activeWorkspaceTabId
    ) {
      activeWorkspaceTabId =
        null;
      activeWorkspaceKey =
        null;
    }
  }
);


window
  .matchMedia(
    "(prefers-color-scheme: dark)"
  )
  .addEventListener(
    "change",
    () => {
      if (
        replyForgeSettings.theme ===
        "system"
      ) {
        applyReplyForgeSettings();
      }
    }
  );
