function HistoryList({
  history,
  setReply,
  setMessage,
  deleteHistoryItem,
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Saved activity
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            Reply History
          </h2>
        </div>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {history.length} replies
        </span>
      </div>

      {history.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
          <div className="text-4xl">🕘</div>

          <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
            No replies yet
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Your generated replies will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <article
              key={item.id || index}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {item.tone || "Professional"}
                </span>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  {item.length || "Medium"}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {item.language || "English"}
                </span>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Original message
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {item.message}
                </p>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Generated reply
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-slate-200">
                  {item.reply}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setMessage(item.message);
                    setReply(item.reply);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="flex-1 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300"
                >
                  🔄 Use Again
                </button>

                <button
                  onClick={() => deleteHistoryItem(index)}
                  className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                  🗑 Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default HistoryList;