import { useEffect } from "react";
import PWAInstallButton from "./PWAInstallButton";

const CONTACT_EMAIL = "praveen.kumar281985@gmail.com";

const productCards = [
  {
    eyebrow: "Web workspace",
    title: "Create polished replies on any device",
    description:
      "Draft, rewrite, translate, organize history, and run a detailed communication check from the full ReplyForge workspace.",
    action: "Open web app",
    href: "/?view=app",
    icon: "✦",
    accent: "violet",
  },
  {
    eyebrow: "Chrome extension",
    title: "Reply without leaving your inbox",
    description:
      "Use ReplyForge inside Gmail, WhatsApp Web, and LinkedIn with your same account and daily allowance.",
    action: "Get extension",
    href: "/?view=extension",
    icon: "◉",
    accent: "blue",
  },
];

const capabilities = [
  ["01", "Context-aware writing", "Choose tone, length, language, and persona for every situation."],
  ["02", "AI Reply Coach", "Review clarity, confidence, professionalism, empathy, and readability."],
  ["03", "One connected account", "Keep daily usage and cloud history consistent across web and extension."],
  ["04", "You stay in control", "Edit, copy, regenerate, or improve every reply before you send it."],
];

function BrandMark() {
  return <span className="rf-home-brand-mark">R</span>;
}

function PublicHomePage() {
  useEffect(() => {
    document.title = "ReplyForge AI — The right reply, every time";

    const sectionId = window.location.hash.slice(1);
    if (!sectionId) return undefined;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="rf-home">
      <div className="rf-home-glow rf-home-glow-one" />
      <div className="rf-home-glow rf-home-glow-two" />

      <header className="rf-home-nav">
        <a href="/" className="rf-home-brand" aria-label="ReplyForge home">
          <BrandMark />
          <span><strong>ReplyForge AI</strong><small>Intelligent reply workspace</small></span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#products">Products</a>
          <a href="#features">Features</a>
          <a href="/?view=extension">Extension</a>
          <a href="/?view=app" className="rf-home-nav-cta">Open web app <span>→</span></a>
        </nav>
      </header>

      <main>
        <section className="rf-home-hero">
          <div className="rf-home-hero-copy">
            <span className="rf-home-pill"><i /> Web, mobile, and Chrome—one connected workspace</span>
            <h1>The right reply.<br /><em>Every time.</em></h1>
            <p>
              Turn any message into a clear, confident response. Write on the
              web, install ReplyForge on your phone, or reply directly from
              your browser.
            </p>

            <div className="rf-home-hero-actions">
              <a href="/?view=app" className="rf-home-primary">Start writing free <span>→</span></a>
              <a href="#products" className="rf-home-secondary">Explore all apps</a>
            </div>

            <div className="rf-home-trust">
              <span>✓ 30 AI requests daily</span>
              <span>✓ No provider key required</span>
              <span>✓ Review before sending</span>
            </div>
          </div>

          <div className="rf-home-product-preview" aria-label="ReplyForge product preview">
            <div className="rf-home-preview-bar">
              <div><BrandMark /><strong>Reply workspace</strong></div>
              <span>● Ready</span>
            </div>
            <div className="rf-home-preview-body">
              <span className="rf-home-preview-label">Incoming message</span>
              <p>Could we move tomorrow&apos;s meeting to the afternoon?</p>
              <div className="rf-home-preview-options">
                <span><small>Tone</small>Professional</span>
                <span><small>Length</small>Short</span>
                <span><small>Language</small>English</span>
              </div>
              <div className="rf-home-preview-reply">
                <span>Generated response</span>
                <p>Absolutely—tomorrow afternoon works for me. Please share the time that suits you best.</p>
                <div><b>✓ Saved</b><button type="button">Copy reply</button></div>
              </div>
            </div>
            <div className="rf-home-floating-score"><strong>92</strong><span>Reply score</span></div>
          </div>
        </section>

        <section id="products" className="rf-home-products">
          <div className="rf-home-section-heading">
            <span>Choose your workspace</span>
            <h2>ReplyForge wherever you communicate.</h2>
            <p>Start with any app. Your account, allowance, and reply history stay connected.</p>
          </div>

          <div className="rf-home-product-grid">
            {productCards.map((product) => (
              <article key={product.title} className={`rf-home-product-card is-${product.accent}`}>
                <div className="rf-home-product-icon">{product.icon}</div>
                <span>{product.eyebrow}</span>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <a href={product.href}>{product.action} <b>→</b></a>
              </article>
            ))}

            <article className="rf-home-product-card is-mobile">
              <div className="rf-home-product-icon">▣</div>
              <span>Mobile app</span>
              <h3>Install ReplyForge on your home screen</h3>
              <p>Get an app-like, full-screen experience with mobile navigation and one-tap access to AI Coach.</p>
              <PWAInstallButton className="rf-home-install-button" label="Install mobile app" />
            </article>
          </div>
        </section>

        <section id="features" className="rf-home-features">
          <div className="rf-home-section-heading is-centered">
            <span>Built for real conversations</span>
            <h2>More than a reply generator.</h2>
          </div>
          <div className="rf-home-feature-grid">
            {capabilities.map(([number, title, description]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rf-home-final-cta">
          <div>
            <span>Ready when you are</span>
            <h2>Write your next reply with confidence.</h2>
            <p>Open the workspace in your browser—no provider API key required.</p>
          </div>
          <a href="/?view=app">Open ReplyForge <b>→</b></a>
        </section>
      </main>

      <footer className="rf-home-footer">
        <div className="rf-home-brand"><BrandMark /><span><strong>ReplyForge AI</strong><small>Clearer replies, reviewed by you.</small></span></div>
        <div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href={`mailto:${CONTACT_EMAIL}`}>Contact</a></div>
        <small>© {new Date().getFullYear()} ReplyForge AI</small>
      </footer>
    </div>
  );
}

export default PublicHomePage;
