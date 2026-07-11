function ButtonGroup({ createReply, loading, clearAll }) {
  const primaryButton =
    "flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60";

  const secondaryButton =
    "flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500";

  const clearButton =
    "rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button
        onClick={createReply}
        disabled={loading}
        className={primaryButton}
      >
        {loading ? "Generating..." : "✨ Generate Reply"}
      </button>

      <button
        onClick={createReply}
        disabled={loading}
        className={secondaryButton}
      >
        🔄 Regenerate
      </button>

      <button onClick={clearAll} className={clearButton}>
        🗑 Clear
      </button>
    </div>
  );
}

export default ButtonGroup;