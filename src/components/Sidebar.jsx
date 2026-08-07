function Sidebar({
  darkMode,
  setDarkMode,
  favorites = [],
  search,
  setSearch,
  history = [],
  usageStats,
  onOpenHistory,
  onOpenFavorites,
  onOpenTemplates,
  onOpenTools,
  onNewReply,
  userName,
}) {
  const favoriteCount =
    history.filter((item) => item.isFavorite).length || favorites.length;

  const navigation = [
    { label: "Compose", icon: "✦", action: onNewReply, active: true },
    { label: "History", icon: "◷", action: onOpenHistory, count: history.length },
    { label: "Favorites", icon: "♡", action: onOpenFavorites, count: favoriteCount },
    { label: "Templates", icon: "▱", action: onOpenTemplates },
    { label: "AI tools", icon: "⌘", action: onOpenTools },
  ];

  return (
    <aside className="rf-v4-sidebar">
      <div className="rf-v4-brand">
        <div className="rf-v4-brand-mark">R</div>

        <div>
          <strong>ReplyForge</strong>
          <span>AI writing workspace</span>
        </div>

        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="rf-v4-theme-button"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀" : "☾"}
        </button>
      </div>

      <button type="button" onClick={onNewReply} className="rf-v4-new-reply">
        <span>＋</span>
        New reply
        <kbd>⌘N</kbd>
      </button>

      <label className="rf-v4-sidebar-search">
        <span>⌕</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
        />
        <kbd>⌘K</kbd>
      </label>

      <nav className="rf-v4-nav">
        <p>Workspace</p>

        {navigation.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className={item.active ? "is-active" : ""}
          >
            <span className="rf-v4-nav-icon">{item.icon}</span>
            <span>{item.label}</span>

            {typeof item.count === "number" && (
              <span className="rf-v4-nav-count">{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="rf-v4-sidebar-spacer" />

      <section className="rf-v4-usage rf-v4-usage-analytics">
        <div>
          <span>AI activity today</span>
          <strong>{usageStats?.total || 0} actions</strong>
        </div>

        <div className="rf-v4-usage-mini-grid">
          <div><strong>{usageStats?.counts?.generate || 0}</strong><span>Replies</span></div>
          <div><strong>{usageStats?.counts?.coach || 0}</strong><span>Coach</span></div>
          <div><strong>{usageStats?.counts?.rewrite || 0}</strong><span>Rewrite</span></div>
          <div><strong>{usageStats?.counts?.translate || 0}</strong><span>Translate</span></div>
        </div>

        <div className="rf-v4-usage-secondary">
          <span>Cloud history</span>
          <strong>{history.length} saved</strong>
        </div>

        <button type="button">Upgrade workspace</button>
      </section>

      <div className="rf-v4-profile">
        <div className="rf-v4-avatar">
          {userName?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div>
          <strong>{userName || "User"}</strong>
          <span>Free plan</span>
        </div>

        <button type="button" aria-label="Account menu">•••</button>
      </div>
    </aside>
  );
}

export default Sidebar;
