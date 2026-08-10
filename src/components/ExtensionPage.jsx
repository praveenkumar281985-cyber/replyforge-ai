import { useEffect } from "react";

const extensionUrl = import.meta.env.VITE_EXTENSION_URL?.trim() || "";

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
  useEffect(() => {
    document.title = "ReplyForge Chrome Extension | ReplyForge AI";
  }, []);

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
              {extensionUrl ? (
                <a href={extensionUrl} target="_blank" rel="noreferrer" className="rf-extension-install">
                  <ChromeIcon /> Add to Chrome
                </a>
              ) : (
                <button type="button" className="rf-extension-install" disabled>
                  <ChromeIcon /> Chrome Web Store — coming soon
                </button>
              )}
              <a href="/" className="rf-extension-secondary">Try the web app</a>
            </div>
            {!extensionUrl && <small>Chrome Web Store publishing is in progress. The install button activates automatically when the store URL is configured.</small>}
          </div>

          <div className="rf-extension-preview" aria-label="ReplyForge extension preview">
            <div className="rf-extension-preview-head"><span className="rf-extension-logo">R</span><strong>ReplyForge AI</strong><em>Connected</em></div>
            <div className="rf-extension-usage"><span>Daily AI usage</span><strong>23 of 30 replies remaining</strong><i><b /></i></div>
            <div className="rf-extension-preview-message"><span>Incoming message</span><p>Can you confirm whether tomorrow's meeting is still scheduled?</p></div>
            <div className="rf-extension-preview-controls"><span>Professional</span><span>Short</span><span>English</span><span>Single reply</span></div>
            <div className="rf-extension-generate">Generate Reply</div>
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
