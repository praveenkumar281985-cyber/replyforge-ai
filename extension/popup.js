const messageInput = document.getElementById("message");
const characterCount = document.getElementById("characterCount");
const readSelectionButton = document.getElementById("readSelection");
const generateButton = document.getElementById("generateButton");
const lengthSelect = document.getElementById("length");
const generationModeSelect = document.getElementById("generationMode");
const errorBox = document.getElementById("errorBox");
const templateButtons = document.getElementById("templateButtons");
const clearTemplateButton = document.getElementById("clearTemplateButton");
const selectedTemplateStatus = document.getElementById("selectedTemplateStatus");

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


const RF_STORAGE_KEY =
  "replyforge_popup_state_v253";

let isRestoringPopupState = false;
let popupSaveTimer = null;

function getSerializableCoachAnalyses() {
  return [...coachAnalyses.entries()];
}

function schedulePopupStateSave() {
  if (isRestoringPopupState) {
    return;
  }

  window.clearTimeout(popupSaveTimer);

  popupSaveTimer = window.setTimeout(() => {
    const state = {
      message: messageInput.value,
      selectedTemplate,
      mode: generationModeSelect.value,
      length: lengthSelect.value,
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
    };

    chrome.storage.local.set({
      [RF_STORAGE_KEY]: state,
    });
  }, 120);
}

async function restorePopupState() {
  isRestoringPopupState = true;

  try {
    const stored =
      await chrome.storage.local.get(
        RF_STORAGE_KEY
      );

    const state =
      stored?.[RF_STORAGE_KEY];

    if (!state) {
      return;
    }

    messageInput.value =
      typeof state.message === "string"
        ? state.message
        : "";

    selectedTemplate =
      typeof state.selectedTemplate ===
      "string"
        ? state.selectedTemplate
        : "";

    generationModeSelect.value =
      state.mode === "single"
        ? "single"
        : "multiple";

    lengthSelect.value =
      ["Short", "Medium", "Long"].includes(
        state.length
      )
        ? state.length
        : "Medium";

    generatedReplies =
      Array.isArray(state.generatedReplies)
        ? state.generatedReplies
        : [];

    singleCoachAnalysis =
      state.singleCoachAnalysis || null;

    coachAnalyses.clear();

    if (Array.isArray(state.coachAnalyses)) {
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
      state.activeResult === "single" &&
      typeof state.singleReply ===
        "string" &&
      state.singleReply.trim()
    ) {
      renderSingleReply(
        state.singleReply
      );
    } else if (
      state.activeResult === "multiple" &&
      generatedReplies.length
    ) {
      renderMultipleReplies(
        generatedReplies
      );
    }
  } catch (error) {
    console.error(
      "Messaura state restore error:",
      error
    );
  } finally {
    isRestoringPopupState = false;
  }
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
      ? "Messaura is creating 4 suggestions..."
      : "Messaura is writing your reply..."
    : generationModeSelect.value === "multiple"
      ? "Generate Suggestions"
      : "Generate Reply";
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
  const rawMessage = messageInput.value.trim();
  const message = buildTemplateAwareMessage(rawMessage);

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
      tone: "Professional",
      length: lengthSelect.value,
    });

    if (!response?.success) {
      throw new Error(response?.error || "Reply could not be generated.");
    }

    if (isMultiple) {
      renderMultipleReplies(response.replies);
      schedulePopupStateSave();
      showToast("4 reply suggestions are ready");
    } else {
      renderSingleReply(response.reply);
      schedulePopupStateSave();
      showToast("Your reply is ready");
    }
  } catch (error) {
    console.error(error);
    showError(error?.message || "Unable to generate a reply.");
  } finally {
    setLoading(false);
  }
});

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

document.addEventListener("keydown", (event) => {
  const isGenerateShortcut =
    (event.ctrlKey || event.metaKey) &&
    event.key === "Enter";

  if (!isGenerateShortcut) {
    return;
  }

  event.preventDefault();

  if (!generateButton.disabled) {
    generateButton.click();
  }
});

updateCharacterCount();
updateGenerateButtonText();
updateTemplateUI();
restorePopupState();
