import { useEffect, useRef, useState } from "react";
import supabase from "../lib/supabase";

const DAILY_LIMIT = 30;

export default function ResponsiveAccountMenu({
  userName,
  userEmail,
  usageStats,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [serverUsage, setServerUsage] = useState({ used: 0, remaining: DAILY_LIMIT });
  const menuRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadUsage() {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("ai_usage_daily")
        .select("request_count")
        .eq("usage_date", today)
        .maybeSingle();

      if (!active || error) return;
      const used = Number(data?.request_count) || 0;
      setServerUsage({ used, remaining: Math.max(DAILY_LIMIT - used, 0) });
    }

    loadUsage();
    return () => { active = false; };
  }, [usageStats?.total, open]);

  useEffect(() => {
    if (!open) return undefined;

    function closeOnOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await onLogout();
      setOpen(false);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="rf-responsive-account" ref={menuRef}>
      <button
        type="button"
        className="rf-responsive-account-trigger"
        aria-label="Open account menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {userName?.charAt(0)?.toUpperCase() || "U"}
      </button>

      {open && (
        <section className="rf-responsive-account-panel" aria-label="Account details">
          <header>
            <span>{userName?.charAt(0)?.toUpperCase() || "U"}</span>
            <div>
              <strong>{userName || "Messaura user"}</strong>
              <small title={userEmail}>{userEmail}</small>
            </div>
            <em>Free</em>
          </header>

          <div className="rf-responsive-account-usage">
            <div>
              <span>Daily AI usage</span>
              <strong>{serverUsage.used} / {DAILY_LIMIT}</strong>
            </div>
            <div className="rf-responsive-account-track">
              <i style={{ width: `${Math.min((serverUsage.used / DAILY_LIMIT) * 100, 100)}%` }} />
            </div>
            <small>{serverUsage.remaining} replies remaining today</small>
          </div>

          <button
            type="button"
            className="rf-responsive-account-logout"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <span aria-hidden="true">↪</span>
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </section>
      )}
    </div>
  );
}
