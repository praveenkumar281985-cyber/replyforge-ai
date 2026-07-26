import { useEffect, useRef, useState } from "react";

function ReplyBox({
  reply,
  setReply,
  rewriteReply,
  translateReply,
translateLoading,
  rewriteLoading,
  regenerateReply,
  generateLoading,
}) {
  const [copied, setCopied] = useState(false);
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(-1);

  const pendingVersionLabel = useRef("Original");
  const selectingOldVersion = useRef(false);

  const rewriteModes = [
    
    {
      label: "Professional",
      icon: "✨",
      mode: "Professional",
    },
    {
      label: "Friendly",
      icon: "😊",
      mode: "Friendly",
    },
    {
      label: "Funny",
      icon: "😂",
      mode: "Funny",
    },
    {
      label: "Shorter",
      icon: "📏",
      mode: "Shorter",
    },
    {
      label: "Longer",
      icon: "📝",
      mode: "Longer",
    },
    {
      label: "More Polite",
      icon: "❤️",
      mode: "More Polite",
    },
    {
      label: "Business",
      icon: "💼",
      mode: "Business",
    },
    {
      label: "Stronger",
      icon: "⚡",
      mode: "Stronger",
    },
  ];
  const languages = [
  { name: "English", flag: "🇺🇸" },
  { name: "Hindi", flag: "🇮🇳" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" },
  { name: "Japanese", flag: "🇯🇵" },
  { name: "Arabic", flag: "🇸🇦" },
];

  useEffect(() => {
    const cleanReply = reply?.trim();

    if (!cleanReply) {
      setVersions([]);
      setCurrentVersion(-1);
      pendingVersionLabel.current = "Original";
      selectingOldVersion.current = false;
      return;
    }

    if (selectingOldVersion.current) {
      selectingOldVersion.current = false;
      return;
    }

    setVersions((currentVersions) => {
      const existingIndex = currentVersions.findIndex(
        (version) => version.text === cleanReply
      );

      if (existingIndex !== -1) {
        setCurrentVersion(existingIndex);
        return currentVersions;
      }

      const newVersion = {
        id: `${Date.now()}-${Math.random()}`,
        text: cleanReply,
        label:
          currentVersions.length === 0
            ? "Original"
            : pendingVersionLabel.current || "Rewritten",
        createdAt: new Date().toISOString(),
      };

      const updatedVersions = [...currentVersions, newVersion];

      setCurrentVersion(updatedVersions.length - 1);
      pendingVersionLabel.current = "Rewritten";

      return updatedVersions;
    });
  }, [reply]);

  const handleRewrite = async (mode) => {
    if (!reply || rewriteLoading || generateLoading) return;

    pendingVersionLabel.current = mode;
    await rewriteReply(mode);
  };
  const handleTranslate = async (language) => {
  if (!reply || isBusy) return;

  await translateReply(language);
};

  const handleRegenerate = async () => {
    if (!reply || rewriteLoading || generateLoading) return;

    pendingVersionLabel.current = "Regenerated";
    await regenerateReply();
  };

  const selectVersion = (index) => {
    const selectedVersion = versions[index];

    if (!selectedVersion) return;

    selectingOldVersion.current = true;
    setCurrentVersion(index);
    setReply(selectedVersion.text);
  };

  const showPreviousVersion = () => {
    if (currentVersion <= 0) return;

    selectVersion(currentVersion - 1);
  };

  const showNextVersion = () => {
    if (currentVersion >= versions.length - 1) return;

    selectVersion(currentVersion + 1);
  };

  const handleCopy = async () => {
    if (!reply) return;

    try {
      await navigator.clipboard.writeText(reply);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleDownload = () => {
    if (!reply) return;

    const blob = new Blob([reply], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "replyforge-reply.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const isBusy =
  rewriteLoading || translateLoading || generateLoading;

  return (
    <section className="mt-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Generated Reply
        </label>

        {reply && (
          <div className="flex flex-wrap items-center gap-2">
            {versions.length > 0 && (
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                Version {currentVersion + 1} of {versions.length}
              </span>
            )}

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {reply.length} characters
            </span>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
        <div className="relative">
          <textarea
            value={reply}
            placeholder="Your AI-generated reply will appear here..."
            readOnly
            className="min-h-48 w-full resize-y rounded-2xl border-0 bg-white px-4 py-4 text-base leading-7 text-slate-900 outline-none dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
          />

          {isBusy && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />

                <p className="mt-3 text-sm font-bold text-indigo-700 dark:text-indigo-300">
                  {rewriteLoading
                    ? "Rewriting your reply..."
                    : "Generating your reply..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {versions.length > 1 && (
          <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  Version History
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {versions[currentVersion]?.label || "Reply version"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={showPreviousVersion}
                  disabled={currentVersion <= 0 || isBusy}
                  className="rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-bold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-purple-800 dark:bg-slate-900 dark:text-purple-300"
                >
                  ← Previous
                </button>

                <span className="min-w-16 text-center text-xs font-bold text-slate-600 dark:text-slate-300">
                  {currentVersion + 1}/{versions.length}
                </span>

                <button
                  type="button"
                  onClick={showNextVersion}
                  disabled={
                    currentVersion >= versions.length - 1 || isBusy
                  }
                  className="rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-bold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-purple-800 dark:bg-slate-900 dark:text-purple-300"
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {versions.map((version, index) => (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => selectVersion(index)}
                  disabled={isBusy}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    currentVersion === index
                      ? "border-purple-500 bg-purple-600 text-white"
                      : "border-purple-200 bg-white text-slate-700 hover:border-purple-400 dark:border-purple-800 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  <span className="block text-xs font-black">
                    Version {index + 1}
                  </span>

                  <span
                    className={`mt-0.5 block max-w-28 truncate text-[11px] ${
                      currentVersion === index
                        ? "text-purple-100"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {version.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {reply && (
          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                AI Rewrite Studio
              </p>

              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                Improve this reply
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Every rewritten reply will be saved as a new version.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {rewriteModes.map((item) => (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => handleRewrite(item.mode)}
                  disabled={!reply || isBusy}
                  className="rounded-xl border border-indigo-200 bg-white px-3 py-3 text-xs font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-400 hover:text-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-900 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-600 dark:hover:text-indigo-300"
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
                {reply && (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                AI Translator
              </p>

              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                Translate this reply
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {languages.map((language) => (
                <button
                  key={language.name}
                  type="button"
                  onClick={() => handleTranslate(language.name)}
                  disabled={!reply || isBusy}
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-3 text-xs font-bold text-slate-700 hover:border-emerald-400 hover:text-emerald-700 disabled:opacity-50"
                >
                  {language.flag} {language.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!reply || isBusy}
            className="rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "✅ Copied" : "📋 Copy Reply"}
          </button>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={!reply || isBusy}
            className="rounded-2xl border border-purple-200 bg-purple-50 px-5 py-3 font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300"
          >
            🔄 Regenerate
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!reply || isBusy}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            📄 Download TXT
          </button>
        </div>
      </div>

      {copied && (
        <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          Reply copied successfully
        </div>
      )}
    </section>
  );
}

export default ReplyBox;