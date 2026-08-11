import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import AIProviderButton from "./AIProviderButton";

const DAILY_AI_LIMIT = 30;

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
  userEmail,
  onLogout,
  providerStatus,
  providerPreference,
  onOpenProvider,
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [serverUsage, setServerUsage] = useState({
    used: 0,
    remaining: DAILY_AI_LIMIT,
    limit: DAILY_AI_LIMIT,
  });

  useEffect(() => {
    let active = true;

    async function loadServerUsage() {
      const today = new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("ai_usage_daily")
        .select("request_count")
        .eq("usage_date", today)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.warn("Unable to load server AI usage:", error);
        return;
      }

      const used = Number(data?.request_count) || 0;

      setServerUsage({
        used,
        remaining: Math.max(DAILY_AI_LIMIT - used, 0),
        limit: DAILY_AI_LIMIT,
      });
    }

    loadServerUsage();

    return () => {
      active = false;
    };
  }, [usageStats?.total]);

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
          className="rf-v4-brand-account-button"
          aria-label="Open account menu"
          aria-expanded={accountMenuOpen}
          onClick={() => setAccountMenuOpen((open) => !open)}
        >
          {userName?.charAt(0)?.toUpperCase() || "U"}
        </button>

        {accountMenuOpen && (
          <div className="rf-v4-account-menu rf-v4-brand-account-menu">
            <div><strong>{userName || "User"}</strong><span>{userEmail}</span><small>Free plan</small></div>
            <button type="button" className="rf-v4-account-theme" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀ Light appearance" : "☾ Dark appearance"}
            </button>
            <button type="button" onClick={onLogout}>Sign out</button>
          </div>
        )}
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
          <span>AI usage today</span>
          <strong>
            {serverUsage.used} / {serverUsage.limit} requests
          </strong>
        </div>

        <div className="rf-v4-usage-mini-grid">
          <div><strong>{usageStats?.counts?.generate || 0}</strong><span>Replies</span></div>
          <div><strong>{usageStats?.counts?.coach || 0}</strong><span>Coach</span></div>
          <div><strong>{usageStats?.counts?.rewrite || 0}</strong><span>Rewrite</span></div>
          <div><strong>{usageStats?.counts?.translate || 0}</strong><span>Translate</span></div>
        </div>

        <div className="rf-v4-sidebar-provider">
          <span>AI engine</span>
          <AIProviderButton
            provider={providerStatus}
            preference={providerPreference}
            onClick={onOpenProvider}
          />
        </div>

        <div className="rf-v4-usage-secondary">
          <span>Daily allowance</span>
          <strong>{serverUsage.remaining} remaining</strong>
        </div>

        <div className="rf-v4-usage-secondary">
          <span>Cloud history</span>
          <strong>{history.length} saved</strong>
        </div>

        <button type="button">Upgrade workspace</button>
      </section>

    </aside>
  );
}

export default Sidebar;
