import { useEffect } from "react";

const CONTACT_EMAIL = "praveen.kumar281985@gmail.com";
const LAST_UPDATED = "August 9, 2026";

const privacySections = [
  {
    title: "1. Information we collect",
    paragraphs: [
      "We collect the information needed to provide ReplyForge AI, including your name, email address, authentication details, and basic account metadata.",
      "When you use the service, we may process incoming messages, generated replies, saved history, favorites, templates, selected tone, language, length, persona, provider preference, daily request counts, and feature usage.",
      "We may also collect limited technical and security information such as browser type, device information, timestamps, error logs, and authentication events.",
    ],
  },
  {
    title: "2. How we use information",
    bullets: [
      "Provide, operate, and maintain ReplyForge AI.",
      "Generate, rewrite, translate, analyze, and improve replies requested by you.",
      "Authenticate users, protect accounts, prevent abuse, and enforce usage limits.",
      "Save your preferences and content when you choose to use those features.",
      "Diagnose errors, improve reliability, and communicate important service updates.",
    ],
  },
  {
    title: "3. AI processing and third-party services",
    paragraphs: [
      "To provide AI features, your prompt and selected settings may pass through Supabase Edge Functions and be sent to the currently configured AI provider, which may include Google Gemini, Groq, or OpenRouter. These providers process the content only as needed to return the requested result, subject to their own terms and privacy practices.",
      "ReplyForge also relies on service providers such as Supabase for authentication and data storage, Vercel for application hosting, and Google for optional Google sign-in.",
      "Do not submit passwords, payment-card data, government identifiers, medical records, or other highly sensitive information in a prompt unless you are authorized and understand the applicable risks.",
    ],
  },
  {
    title: "4. Storage and retention",
    paragraphs: [
      "Drafts and preferences may be stored in your browser. Account, history, favorites, templates, and usage information may be stored in Supabase. We retain information only for as long as reasonably necessary to provide the service, meet legal obligations, resolve disputes, and protect the service.",
      "You can remove saved reply history through available product controls. For account or data-deletion requests, contact us at the email below.",
    ],
  },
  {
    title: "5. Sharing and sale of data",
    paragraphs: [
      "We do not sell or rent your personal information. We may share limited information with service providers that help operate ReplyForge, when required by law, to protect users or the service, or as part of a business reorganization subject to appropriate safeguards.",
    ],
  },
  {
    title: "6. Security",
    paragraphs: [
      "We use reasonable technical and organizational safeguards designed to protect your information. No online service or storage system can guarantee absolute security, so you should use a strong password and protect access to your account.",
    ],
  },
  {
    title: "7. Your choices and rights",
    paragraphs: [
      "Depending on your location, you may have rights to access, correct, delete, restrict, or receive a copy of your personal information. You may also withdraw consent where processing is based on consent. Contact us to submit a request; we may need to verify your identity first.",
    ],
  },
  {
    title: "8. Children, international processing, and changes",
    paragraphs: [
      "ReplyForge is not intended for children under 13. If local law requires a higher minimum age, a parent or legal guardian must provide any required consent.",
      "Our providers may process information in countries other than your own. We take reasonable steps to use appropriate safeguards where required.",
      "We may update this Privacy Policy as the service evolves. We will post the updated version here and change the last-updated date.",
    ],
  },
];

const termsSections = [
  {
    title: "1. Acceptance and eligibility",
    paragraphs: [
      "By accessing or using ReplyForge AI, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.",
      "You must be at least 13 years old and legally able to enter into these terms. If you are below the age of legal majority where you live, a parent or legal guardian must supervise and approve your use.",
    ],
  },
  {
    title: "2. Accounts",
    paragraphs: [
      "You must provide accurate account information, keep your credentials secure, and promptly notify us of suspected unauthorized access. You are responsible for activity performed through your account unless prohibited by applicable law.",
    ],
  },
  {
    title: "3. The service",
    paragraphs: [
      "ReplyForge helps users draft, rewrite, translate, analyze, and organize replies using artificial intelligence. Features, provider availability, usage limits, and free-plan allowances may change as the service develops.",
    ],
  },
  {
    title: "4. Acceptable use",
    bullets: [
      "Do not use ReplyForge for unlawful, fraudulent, deceptive, abusive, harassing, or harmful activity.",
      "Do not impersonate others, send spam, distribute malware, or violate privacy, intellectual-property, or other rights.",
      "Do not attempt to bypass rate limits, access another user account, disrupt the service, or probe the service for vulnerabilities without written permission.",
      "Do not represent AI-generated content as verified fact when doing so could mislead or harm someone.",
    ],
  },
  {
    title: "5. AI output and your responsibility",
    paragraphs: [
      "AI output can be incomplete, inaccurate, outdated, or unsuitable. You are responsible for reviewing and editing every reply before sending or relying on it.",
      "ReplyForge does not provide legal, medical, financial, employment, or other professional advice. You remain responsible for your communications, decisions, and compliance with applicable laws and workplace policies.",
    ],
  },
  {
    title: "6. Your content",
    paragraphs: [
      "You retain ownership of content you submit and of your rights in generated output, to the extent permitted by law and third-party provider terms. You grant us a limited license to host, process, transmit, and display your content only as needed to operate, secure, and improve the service.",
      "You confirm that you have the necessary rights and permissions to submit the content you provide.",
    ],
  },
  {
    title: "7. Third-party services",
    paragraphs: [
      "ReplyForge depends on third-party services, including authentication, hosting, database, and AI providers. Their services may have separate terms, limits, availability, and privacy practices that we do not control.",
    ],
  },
  {
    title: "8. Availability, suspension, and termination",
    paragraphs: [
      "We may modify, pause, or discontinue features and may suspend or terminate access when reasonably necessary to protect the service, comply with law, address abuse, or enforce these terms. You may stop using ReplyForge at any time.",
    ],
  },
  {
    title: "9. Disclaimers and limitation of liability",
    paragraphs: [
      "ReplyForge is provided on an as-is and as-available basis to the extent permitted by law. We do not guarantee uninterrupted service or that AI output will be accurate or fit for a particular purpose.",
      "To the maximum extent permitted by law, ReplyForge and its operator will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the service. Nothing in these terms excludes liability that cannot legally be excluded.",
    ],
  },
  {
    title: "10. Changes and contact",
    paragraphs: [
      "We may update these terms as ReplyForge evolves. Continued use after an updated version takes effect means you accept the revised terms, where permitted by law.",
      "Questions about these terms can be sent to the contact email below.",
    ],
  },
];

function LegalPage({ type }) {
  const isPrivacy = type === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service";
  const sections = isPrivacy ? privacySections : termsSections;

  useEffect(() => {
    document.title = `${title} | ReplyForge AI`;
  }, [title]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="/" className="flex items-center gap-3" aria-label="ReplyForge home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-black text-white shadow-lg shadow-indigo-200">
              R
            </span>
            <span>
              <strong className="block text-sm font-black">ReplyForge AI</strong>
              <span className="block text-xs text-slate-500">AI writing workspace</span>
            </span>
          </a>

          <a
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
          >
            Back to app
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">
          <div className="border-b border-slate-200 pb-7">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
              ReplyForge legal
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Effective and last updated: {LAST_UPDATED}
            </p>
          </div>

          <div className="mt-8 space-y-9">
            <p className="text-base leading-7 text-slate-600">
              {isPrivacy
                ? "This Privacy Policy explains how ReplyForge AI collects, uses, stores, and shares information when you use the service."
                : "These Terms of Service govern your access to and use of ReplyForge AI. Please read them carefully before using the service."}
            </p>

            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                  {section.title}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    {paragraph}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 sm:text-base">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <h2 className="text-lg font-black text-slate-900">Contact us</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                For privacy, legal, account, or data-deletion questions, email{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-bold text-indigo-700 underline decoration-indigo-300 underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </div>

        <nav className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-bold text-slate-600">
          <a href="/privacy" className="hover:text-indigo-700">Privacy Policy</a>
          <a href="/terms" className="hover:text-indigo-700">Terms of Service</a>
          <a href="/" className="hover:text-indigo-700">ReplyForge AI</a>
        </nav>
      </main>
    </div>
  );
}

export default LegalPage;
