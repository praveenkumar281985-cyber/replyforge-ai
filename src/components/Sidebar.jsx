function Sidebar({
  darkMode,
  setDarkMode,
  favorites,
  setFavorites,
  search,
  setSearch,
}) {
  const deleteFavorite = (indexToDelete) => {
    setFavorites((previousFavorites) =>
      previousFavorites.filter(
        (_, index) => index !== indexToDelete
      )
    );
  };

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
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
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

        {favorites.length > 0 && (
          <button
            onClick={() => setFavorites([])}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            Clear all
          </button>
        )}
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

              <button
                onClick={() => deleteFavorite(index)}
                className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                🗑 Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;