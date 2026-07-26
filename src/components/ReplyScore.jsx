function ReplyScore({
  replyScore,
  scoreLoading,
  analyzeReply,
}) {
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            AI Review
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            Reply Score
          </h3>
        </div>

        <button
          type="button"
          onClick={analyzeReply}
          disabled={scoreLoading}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {scoreLoading ? "Analyzing..." : "Analyze Reply"}
        </button>
      </div>

      {!replyScore ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Click <strong>Analyze Reply</strong> to get AI feedback.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          <div className="flex justify-between">
            <span>Overall</span>
            <strong>{replyScore.overall}/100</strong>
          </div>

          <div className="flex justify-between">
            <span>Grammar</span>
            <strong>{replyScore.grammar}/100</strong>
          </div>

          <div className="flex justify-between">
            <span>Clarity</span>
            <strong>{replyScore.clarity}/100</strong>
          </div>

          <div className="flex justify-between">
            <span>Professionalism</span>
            <strong>{replyScore.professionalism}/100</strong>
          </div>

          <div className="flex justify-between">
            <span>Politeness</span>
            <strong>{replyScore.politeness}/100</strong>
          </div>

          <div className="flex justify-between">
            <span>Confidence</span>
            <strong>{replyScore.confidence}/100</strong>
          </div>

          <div className="mt-5">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Suggestions
            </h4>

            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
              {replyScore.suggestions?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReplyScore;