import { useEffect, useState } from "react";

const configuredExtensionUrl = import.meta.env.VITE_EXTENSION_URL?.trim() || "";
const extensionUrl = configuredExtensionUrl || "/replyforge-extension-v3.3.3.zip";
const isStoreInstall = Boolean(configuredExtensionUrl);

const benefits = [
  ["Works where you reply", "Draft inside Gmail, WhatsApp Web and LinkedIn without switching tabs."],
  ["One ReplyForge account", "Use the same Google account and shared 30-replies-per-day allowance."],
  ["Ready-to-send controls", "Choose tone, language, length and single or four-suggestion mode."],
  ["Private provider setup", "No OpenRouter or Groq API key is stored in the browser extension."],
];

function ChromeIcon() {
  return <span className="rf-extension-chrome-icon" aria-hidden="true">◉</span>;
}

function ExtensionPage() {
  const [activeInstallStep, setActiveInstallStep] = useState(1);
  const [copiedChromeUrl, setCopiedChromeUrl] = useState(false);

  useEffect(() => {
    document.title = "ReplyForge Chrome Extension | ReplyForge AI";
  }, []);

  async function copyChromeExtensionsUrl() {
    try {
      await navigator.clipboard.writeText("chrome://extensions");
      setCopiedChromeUrl(true);
      window.setTimeout(() => setCopiedChromeUrl(false), 2200);
    } catch {
      setCopiedChromeUrl(false);
    }
  }

  return (
    <div className="rf-extension-page">
      <header className="rf-extension-nav">
        <a href="/about" className="rf-extension-brand"><span>R</span><strong>ReplyForge AI</strong></a>
        <a href="/" className="rf-extension-open-app">Open web app</a>
      </header>

      <main>
        <section className="rf-extension-hero">
          <div className="rf-extension-copy">
            <span className="rf-extension-eyebrow">ReplyForge for Chrome</span>
            <h1>Write better replies without leaving your inbox.</h1>
            <p>Bring ReplyForge directly into Gmail, WhatsApp Web and LinkedIn. Generate, rewrite, improve and insert replies from a focused side panel.</p>
            <div className="rf-extension-actions">
              <a
                href={extensionUrl}
                target={isStoreInstall ? "_blank" : undefined}
                rel={isStoreInstall ? "noreferrer" : undefined}
                download={isStoreInstall ? undefined : "ReplyForge-Extension-v3.3.3.zip"}
                className="rf-extension-install"
              >
                <ChromeIcon /> {isStoreInstall ? "Add to Chrome" : "Download for Chrome"}
              </a>
              <a href="/" className="rf-extension-secondary">Try the web app</a>
            </div>
            {!isStoreInstall && (
              <div className="rf-extension-install-note" role="note">
                <strong>Quick install</strong>
                <div className="rf-extension-install-steps" aria-label="Extension installation steps">
                  <button type="button" className={activeInstallStep === 1 ? "active" : ""} onClick={() => setActiveInstallStep(1)}><b>1</b> Download</button>
                  <button type="button" className={activeInstallStep === 2 ? "active" : ""} onClick={() => setActiveInstallStep(2)}><b>2</b> Extract</button>
                  <button type="button" className={activeInstallStep === 3 ? "active" : ""} onClick={() => setActiveInstallStep(3)}><b>3</b> Add to Chrome</button>
                </div>
                <div className="rf-extension-step-detail" aria-live="polite">
                  {activeInstallStep === 1 && <><span>Click “Download for Chrome” and save the ZIP file.</span><a href={extensionUrl} download="ReplyForge-Extension-v3.3.3.zip">Download again</a></>}
                  {activeInstallStep === 2 && <span>Open Downloads, right-click the ZIP and choose <b>Extract all</b>. Keep the extracted folder.</span>}
                  {activeInstallStep === 3 && <><span>Open <b>chrome://extensions</b>, enable Developer mode, choose <b>Load unpacked</b>, then select the extracted folder.</span><button type="button" onClick={copyChromeExtensionsUrl}>{copiedChromeUrl ? "Copied ✓" : "Copy Chrome URL"}</button></>}
                </div>
              </div>
            )}
          </div>

          <div className="rf-extension-preview" aria-label="ReplyForge extension preview">
            <div className="rf-extension-preview-head"><span className="rf-extension-logo">R</span><strong>ReplyForge AI</strong><em>Connected</em></div>
            <div className="rf-extension-usage"><span>Daily AI usage</span><strong>23 of 30 replies remaining</strong><i><b /></i></div>
            <div className="rf-extension-preview-message"><span>Incoming message</span><p>Can you confirm whether tomorrow's meeting is still scheduled?</p></div>
            <div className="rf-extension-preview-controls"><span>Professional</span><span>Short</span><span>English</span><span>Single reply</span></div>
            <div className="rf-extension-generate"><span>Generate Reply</span><small>Extension preview</small></div>
          </div>
        </section>

        <section className="rf-extension-benefits">
          {benefits.map(([title, description]) => (
            <article key={title}><span>✓</span><h2>{title}</h2><p>{description}</p></article>
          ))}
        </section>
      </main>

      <footer className="rf-extension-footer">ReplyForge AI · You review every reply before sending.</footer>
    </div>
  );
}

export default ExtensionPage;
