function Sidebar({
  darkMode,
  setDarkMode,
  favorites,
  setFavorites,
  search,
  setSearch,
  history = [],
  setMessage,
  setTone,
}) {
  const templates = [
    {
      title: "Professional Email",
      icon: "💼",
      tone: "Professional",
      prompt:
        "Write a professional reply to this message:\n\n[Paste the received message here]",
    },
    {
      title: "Customer Support",
      icon: "🎧",
      tone: "Helpful",
      prompt:
        "Write a helpful customer support reply to this message:\n\n[Paste the customer message here]",
    },
    {
      title: "Complaint Reply",
      icon: "😡",
      tone: "Professional",
      prompt:
        "Write a firm but respectful reply to this complaint:\n\n[Paste the complaint here]",
    },
    {
      title: "Apology",
      icon: "🙏",
      tone: "Friendly",
      prompt:
        "Write a sincere apology reply for this situation:\n\n[Describe the situation here]",
    },
    {
      title: "Follow-Up",
      icon: "📞",
      tone: "Professional",
      prompt:
        "Write a polite follow-up reply regarding this message:\n\n[Paste the previous message here]",
    },
    {
      title: "Salary Negotiation",
      icon: "💰",
      tone: "Professional",
      prompt:
        "Write a confident and respectful salary negotiation reply:\n\n[Enter the offer or situation here]",
    },
    {
      title: "Interview Reply",
      icon: "🎯",
      tone: "Professional",
      prompt:
        "Write a professional reply to this interview-related message:\n\n[Paste the interview message here]",
    },
    {
      title: "Friendly Reply",
      icon: "😊",
      tone: "Friendly",
      prompt:
        "Write a warm and friendly reply to this message:\n\n[Paste the message here]",
    },
    {
      title: "Funny Reply",
      icon: "😂",
      tone: "Funny",
      prompt:
        "Write a light and funny reply to this message without being offensive:\n\n[Paste the message here]",
    },
    {
      title: "LinkedIn Reply",
      icon: "📈",
      tone: "Professional",
      prompt:
        "Write a concise and professional LinkedIn reply to this message:\n\n[Paste the LinkedIn message here]",
    },
  ];

  const deleteFavorite = (indexToDelete) => {
    setFavorites((previousFavorites) =>
      previousFavorites.filter((_, index) => index !== indexToDelete)
    );
  };

  const useTemplate = (template) => {
    setMessage(template.prompt);

    if (setTone) {
      setTone(template.tone);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const today = new Date();

  const totalReplies = history.length;

  const favoriteReplies = history.filter(
    (item) => item.isFavorite
  ).length;

  const todayReplies = history.filter((item) => {
    if (!item.createdAt) {
      return false;
    }

    const itemDate = new Date(item.createdAt);

    return (
      itemDate.getDate() === today.getDate() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const thisMonthReplies = history.filter((item) => {
    if (!item.createdAt) {
      return false;
    }

    const itemDate = new Date(item.createdAt);

    return (
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const analyticsCards = [
    {
      title: "Total Replies",
      value: totalReplies,
      icon: "💬",
      classes:
        "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300",
    },
    {
      title: "Favorites",
      value: favoriteReplies,
      icon: "⭐",
      classes:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
    },
    {
      title: "Today",
      value: todayReplies,
      icon: "📅",
      classes:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
    },
    {
      title: "This Month",
      value: thisMonthReplies,
      icon: "🔥",
      classes:
        "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/50 dark:text-purple-300",
    },
  ];

  return (
    <aside className="rounded-3xl border border-white/20 bg-white/90 p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Workspace
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            ReplyForge AI
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="mb-7">
        <div className="mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Dashboard
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            Your Activity
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {analyticsCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${card.classes}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{card.icon}</span>

                <span className="text-2xl font-black">
                  {card.value}
                </span>
              </div>

              <p className="mt-3 text-xs font-bold uppercase tracking-wide">
                {card.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-7">
        <div className="mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            AI Prompt Library
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            Quick Templates
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Choose a template and replace the sample text with your message.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {templates.map((template) => (
            <button
              key={template.title}
              type="button"
              onClick={() => useTemplate(template)}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40"
            >
              <span className="text-xl">{template.icon}</span>

              <p className="mt-2 text-xs font-bold leading-5 text-slate-700 dark:text-slate-200">
                {template.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-7">
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Search history
        </label>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search replies..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-950"
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          ⭐ Favorites
        </h3>

        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          {favorites.length}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
          <div className="text-3xl">⭐</div>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            No favorite replies yet.
          </p>
        </div>
      ) : (
        <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {favorites.map((favorite, index) => (
            <div
              key={`${favorite}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="line-clamp-4 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {favorite}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(favorite)
                  }
                  className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                >
                  📋 Copy
                </button>

                <button
                  type="button"
                  onClick={() => deleteFavorite(index)}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;