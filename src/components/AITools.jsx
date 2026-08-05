const tools = [
  ["rewrite", "✎", "Rewrite"],
  ["translate", "◎", "Translate"],
  ["grammar", "Aa", "Grammar"],
  ["humanize", "◉", "Humanize"],
  ["shorten", "−", "Shorten"],
  ["expand", "+", "Expand"],
  ["followup", "→", "Follow-up"],
  ["email", "✉", "Email"],
];

function AITools({
  onRewrite,
  onTranslate,
  onTool,
  busy,
  activeTool,
}) {
  function handleTool(id) {
    if (busy) return;

    if (id === "rewrite") {
      onRewrite();
      return;
    }

    if (id === "translate") {
      onTranslate();
      return;
    }

    onTool(id);
  }

  return (
    <section className="rf-tools-bar">
      <div className="flex min-w-0 items-center gap-2">
        <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:inline">
          AI tools
        </span>

        <div className="rf-scroll flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5">
          {tools.map(([id, icon, title]) => (
            <button
              key={id}
              type="button"
              onClick={() => handleTool(id)}
              disabled={busy}
              className="rf-tool-chip"
            >
              <span className="text-[11px] text-violet-600 dark:text-violet-300">
                {activeTool === id ? "…" : icon}
              </span>
              {title}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AITools;
