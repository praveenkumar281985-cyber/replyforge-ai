function AIActions({ onAction }) {
  const actions = [
    { label: "✨ Improve", prompt: "Improve this reply." },
    { label: "😊 Friendly", prompt: "Rewrite this reply in a friendly tone." },
    { label: "💼 Professional", prompt: "Rewrite this reply professionally." },
    { label: "😂 Funny", prompt: "Rewrite this reply humorously." },
    { label: "📏 Shorten", prompt: "Make this reply shorter." },
    { label: "📖 Expand", prompt: "Expand this reply." },
    { label: "🌍 Translate", prompt: "Translate this reply into English." },
  ];

  return (
    <div className="mt-5">
      <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">
        AI Actions
      </h3>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => onAction(action.prompt)}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-indigo-600 hover:text-white dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-indigo-600"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AIActions;