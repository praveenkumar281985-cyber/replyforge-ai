import { useState } from "react";

function ReplyBox({ reply }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!reply) return;

    await navigator.clipboard.writeText(reply);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleDownload = () => {
    if (!reply) return;

    const blob = new Blob([reply], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "replyforge-reply.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-8">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Generated Reply
        </label>

        {reply && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {reply.length} characters
          </span>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
        <textarea
          value={reply}
          placeholder="Your AI-generated reply will appear here..."
          readOnly
          className="min-h-48 w-full resize-y rounded-2xl border-0 bg-white px-4 py-4 text-base leading-7 text-slate-900 outline-none dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleCopy}
            disabled={!reply}
            className="flex-1 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "✅ Copied" : "📋 Copy Reply"}
          </button>

          <button
            onClick={handleDownload}
            disabled={!reply}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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