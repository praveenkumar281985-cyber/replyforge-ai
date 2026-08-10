import { useEffect } from "react";

const CONTACT_EMAIL = "praveen.kumar281985@gmail.com";

const features = [
  {
    title: "Generate polished replies",
    description:
      "Paste an incoming message and create a clear, ready-to-review response in seconds.",
  },
  {
    title: "Control tone and context",
    description:
      "Choose tone, reply length, language, and persona so the response fits the situation.",
  },
  {
    title: "Review before sending",
    description:
      "Use communication scoring, rewriting, translation, and editing tools to refine every reply.",
  },
];

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 2.75c.68 4.55 3.19 7.06 7.75 7.75-4.56.68-7.07 3.19-7.75 7.75-.68-4.56-3.19-7.07-7.75-7.75C8.81 9.81 11.32 7.3 12 2.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PublicHomePage() {
  useEffect(() => {
    document.title = "ReplyForge AI | AI Reply Writing Workspace";
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,_rgba(99,102,241,0.32),_transparent_32%),radial-gradient(circle_at_82%_22%,_rgba(139,92,246,0.2),_transparent_28%)]" />

      <header className="relative z-10 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/about" className="flex items-center gap-3" aria-label="ReplyForge AI home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-base font-black shadow-lg shadow-indigo-950">
              R
            </span>
            <span>
              <strong className="block text-sm font-black">ReplyForge AI</strong>
              <span className="block text-[11px] text-slate-400">AI writing workspace</span>
            </span>
          </a>

          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main navigation">
            <a
              href="/?view=extension"
              className="hidden rounded-xl border border-indigo-300/25 bg-indigo-400/10 px-3 py-2 text-xs font-black text-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-400/20 sm:block"
            >
              Chrome Extension
            </a>
            <a
              href="/privacy"
              className="hidden px-3 py-2 text-xs font-bold text-slate-300 transition hover:text-white sm:block"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="hidden px-3 py-2 text-xs font-bold text-slate-300 transition hover:text-white sm:block"
            >
              Terms
            </a>
            <a
              href="/"
              className="rounded-xl bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              Open ReplyForge
            </a>
          </nav>
        </div>
      </header>

      <main className="relative z-[1]">
        <section className="mx-auto grid max-w-6xl items-center gap-9 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12 lg:py-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-indigo-200">
              <SparkIcon /> AI-assisted communication
            </span>

            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.03] tracking-[-0.045em] sm:text-[44px] lg:text-[52px]">
              Write the right reply,
              <span className="block bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                with confidence.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              ReplyForge AI helps you draft, rewrite, translate, analyze, and
              organize clear professional replies for everyday communication.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-black shadow-xl shadow-indigo-950/70 transition hover:-translate-y-0.5"
              >
                <SparkIcon /> Start writing
              </a>
              <a
                href="/?view=extension"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-300/25 bg-indigo-400/10 px-5 py-3 text-sm font-black text-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-400/20"
              >
                ◉ Get Chrome Extension
              </a>
              <a
                href="/privacy"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-white/25 hover:bg-white/10"
              >
                How we protect data
              </a>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 30 replies daily</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Multiple AI providers</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> You review before sending</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative rounded-[26px] border border-white/15 bg-white/[0.07] p-3 shadow-2xl backdrop-blur-xl sm:p-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-indigo-300">
                    AI Composer
                  </span>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                    Ready
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                  <p className="text-[11px] font-bold text-slate-400">Incoming message</p>
                  <p className="mt-2 text-sm leading-5 text-slate-200">
                    Can you confirm whether tomorrow&apos;s meeting is still scheduled?
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Tone</p>
                    <p className="mt-1 text-xs font-bold text-slate-200">Professional</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Length</p>
                    <p className="mt-1 text-xs font-bold text-slate-200">Short</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 p-3.5 shadow-lg shadow-indigo-950/60">
                  <p className="text-[10px] font-black uppercase tracking-wider text-indigo-100">Generated reply</p>
                  <p className="mt-2 text-sm leading-5 text-white">
                    Yes, the meeting is confirmed for tomorrow. I look forward to speaking with you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.035]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="max-w-2xl">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-300">
                What ReplyForge AI does
              </span>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                From incoming message to send-ready response
              </h2>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-slate-900/65 p-5 shadow-xl"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-400/10 text-xs font-black text-indigo-300">
                    0{index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-black">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-[1] border-t border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <strong className="text-slate-200">ReplyForge AI</strong>
            <p className="mt-1">Clearer replies, reviewed by you.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-bold">
            <a href="/privacy" className="hover:text-white">Privacy Policy</a>
            <a href="/terms" className="hover:text-white">Terms of Service</a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicHomePage;
