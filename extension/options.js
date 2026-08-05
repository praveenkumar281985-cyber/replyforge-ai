const settingsForm = document.getElementById("settingsForm");
const openRouterInput = document.getElementById("openRouterApiKey");
const groqInput = document.getElementById("groqApiKey");
const clearButton = document.getElementById("clearButton");
const statusMessage = document.getElementById("statusMessage");

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.hidden = false;
}

async function loadSettings() {
  const settings = await chrome.storage.local.get([
    "openRouterApiKey",
    "groqApiKey",
  ]);

  openRouterInput.value = settings.openRouterApiKey || "";
  groqInput.value = settings.groqApiKey || "";
}

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const openRouterApiKey = openRouterInput.value.trim();
  const groqApiKey = groqInput.value.trim();

  if (!openRouterApiKey && !groqApiKey) {
    showStatus(
      "Add at least one OpenRouter or Groq API key.",
      "error"
    );
    return;
  }

  await chrome.storage.local.set({
    openRouterApiKey,
    groqApiKey,
  });

  showStatus("Settings saved successfully.", "success");
});

clearButton.addEventListener("click", async () => {
  await chrome.storage.local.remove([
    "openRouterApiKey",
    "groqApiKey",
  ]);

  openRouterInput.value = "";
  groqInput.value = "";

  showStatus("Saved API keys were removed.", "success");
});

loadSettings().catch((error) => {
  console.error(error);
  showStatus("Settings could not be loaded.", "error");
});
