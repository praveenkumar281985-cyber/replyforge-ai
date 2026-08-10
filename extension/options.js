const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");
const statusMessage = document.getElementById("statusMessage");

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.hidden = false;
}

async function updateStatus() {
  const response = await chrome.runtime.sendMessage({ type: "AUTH_STATUS" });
  const signedIn = Boolean(response?.signedIn);
  signInButton.hidden = signedIn;
  signOutButton.hidden = !signedIn;
  showStatus(
    signedIn ? "Signed in. Your web-app plan and 30/day limit are active." : "Sign in to generate replies.",
    signedIn ? "success" : ""
  );
}

signInButton.addEventListener("click", async () => {
  signInButton.disabled = true;
  const response = await chrome.runtime.sendMessage({ type: "AUTH_SIGN_IN" });
  signInButton.disabled = false;
  if (!response?.success) return showStatus(response?.error || "Google sign-in failed.", "error");
  updateStatus();
});

signOutButton.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "AUTH_SIGN_OUT" });
  updateStatus();
});

updateStatus().catch((error) => showStatus(error?.message || "Could not read sign-in status.", "error"));
