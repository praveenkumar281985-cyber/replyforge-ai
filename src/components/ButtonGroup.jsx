function ButtonGroup({ createReply, loading, clearAll }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <button
        type="button"
        onClick={createReply}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Generating...
          </>
        ) : (
          <>✨ Generate Reply</>
        )}
      </button>

      <button
        type="button"
        onClick={createReply}
        disabled={loading}
        className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500"
      >
        🔄 Regenerate
      </button>

      <button
        type="button"
        onClick={clearAll}
        disabled={loading}
        className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
      >
        🗑 Clear
      </button>
    </div>
  );
}

export default ButtonGroup;