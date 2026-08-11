import { useEffect, useState } from "react";

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
}

export default function PWAInstallButton({ className = "", label = "Install app" }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handlePrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed) return null;

  async function handleInstall() {
    if (!installPrompt) {
      setShowHelp((current) => !current);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  }

  return (
    <>
      <button type="button" className={`rf-pwa-install ${className}`.trim()} onClick={handleInstall}>
        <span aria-hidden="true">↓</span>
        {label}
      </button>
      {showHelp && (
        <div className="rf-pwa-install-note" role="status">
          Browser menu खोलें और <strong>Add to Home Screen</strong> या
          <strong> Install app</strong> चुनें।
        </div>
      )}
    </>
  );
}
