import { useEffect, useRef, useState } from "react";

const quickTools = [
  ["grammar", "Aa", "Grammar"],
  ["humanize", "◉", "Humanize"],
  ["shorten", "−", "Shorten"],
  ["expand", "+", "Expand"],
  ["followup", "→", "Follow-up"],
  ["email", "✉", "Email"],
  ["approve", "✓", "Approve"],
  ["reject", "×", "Reject"],
  ["escalate", "!", "Escalate"],
  ["reminder", "◷", "Reminder"],
  ["delay", "…", "Delay"],
  ["apology", "♡", "Apology"],
];

function ReplyBox({
  reply,
  setReply,
  rewriteReply,
  translateReply,
  translateLoading,
  rewriteLoading,
  regenerateReply,
  generateLoading,
  streaming = false,
  runAiTool,
  toolLoading,
}) {
  const [copied, setCopied] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const toolbarRef = useRef(null);
  const replyContentRef = useRef(null);
  const [showScrollLatest, setShowScrollLatest] = useState(false);
  const autoFollowRef = useRef(true);
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(-1);
  const pendingVersionLabel = useRef("Original");
  const selectingOldVersion = useRef(false);

  const rewriteModes = [
    "Professional",
    "Friendly",
    "Funny",
    "Shorter",
    "Longer",
    "More Polite",
    "Business",
    "Stronger",
  ];

  const languages = [
    "English",
    "Hindi",
    "Spanish",
    "French",
    "German",
    "Japanese",
    "Arabic",
  ];

  const isBusy = Boolean(
    rewriteLoading ||
      translateLoading ||
      generateLoading ||
      toolLoading
  );


  useEffect(() => {
    function handlePointerDown(event) {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target)
      ) {
        setActiveMenu(null);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setActiveMenu(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const cleanReply = reply?.trim();
    let cancelled = false;

    function syncReplyVersion() {
      if (cancelled) return;

      if (!cleanReply) {
        setVersions([]);
        setCurrentVersion(-1);
        pendingVersionLabel.current = "Original";
        selectingOldVersion.current = false;
        return;
      }

      if (selectingOldVersion.current) {
        selectingOldVersion.current = false;
        return;
      }

      setVersions((current) => {
        const existingIndex = current.findIndex(
          (version) => version.text === cleanReply
        );

        if (existingIndex !== -1) {
          setCurrentVersion(existingIndex);
          return current;
        }

        const next = [
          ...current,
          {
            id: `${Date.now()}-${Math.random()}`,
            text: cleanReply,
            label:
              current.length === 0
                ? "Original"
                : pendingVersionLabel.current || "Improved",
          },
        ];

        setCurrentVersion(next.length - 1);
        pendingVersionLabel.current = "Improved";
        return next;
      });
    }

    queueMicrotask(syncReplyVersion);

    return () => {
      cancelled = true;
    };
  }, [reply]);

  async function handleRewrite(mode) {
    if (!reply?.trim() || isBusy) return;
    pendingVersionLabel.current = mode;
    setActiveMenu(null);
    await rewriteReply(mode);
  }

  async function handleTranslate(language) {
    if (!reply?.trim() || isBusy) return;
    pendingVersionLabel.current = `${language} translation`;
    setActiveMenu(null);
    await translateReply(language);
  }

  async function handleQuickTool(tool) {
    if (!reply?.trim() || isBusy) return;
    pendingVersionLabel.current = tool;
    setActiveMenu(null);
    await runAiTool(tool);
  }

  function selectVersion(index) {
    const version = versions[index];
    if (!version || isBusy) return;

    selectingOldVersion.current = true;
    setCurrentVersion(index);
    setReply(version.text);
  }

  async function handleCopy() {
    if (!reply?.trim()) return;
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function handleDownload() {
    if (!reply?.trim()) return;

    const blob = new Blob([reply], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "replyforge-reply.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }


  useEffect(() => {
    const el = replyContentRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      autoFollowRef.current = nearBottom;
      setShowScrollLatest(!nearBottom);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!streaming) return;
    const el = replyContentRef.current;
    if (!el || !autoFollowRef.current) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [reply, streaming]);

  const loadingText = translateLoading
    ? "Translating..."
    : rewriteLoading
      ? "Rewriting..."
      : toolLoading
        ? "Improving..."
        : "Generating...";

  return (
    <section className="rf-v4-reply">
      <header className="rf-v4-reply-header">
        <div>
          <div className="rf-v4-eyebrow">
            <span className="rf-v4-live-dot" />
            Generated response
          </div>

          <h2>Your reply</h2>
        </div>

        <div className="rf-v4-reply-status">
          <span>{versions.length ? `Version ${currentVersion + 1}` : "Draft"}</span>
          <span>{reply?.length || 0} characters</span>
          <span className={streaming ? "rf-v4-streaming-status" : "rf-v4-saved-status"}>
            {streaming ? "● Streaming" : "✓ Saved"}
          </span>
        </div>
      </header>

      <div ref={toolbarRef} id="reply-actions" className="rf-v4-reply-toolbar">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!reply}
          className="rf-v4-toolbar-primary"
        >
          {copied ? "✓ Copied" : "⧉ Copy"}
        </button>

        <div className="rf-v4-toolbar-divider" />

        <div className="rf-v4-popover-anchor">
          <button
            type="button"
            onClick={() =>
              setActiveMenu((current) =>
                current === "rewrite" ? null : "rewrite"
              )
            }
            disabled={!reply || isBusy}
            className={activeMenu === "rewrite" ? "is-active" : ""}
            aria-expanded={activeMenu === "rewrite"}
            aria-haspopup="menu"
          >
            ✎ Rewrite <span>⌄</span>
          </button>

          {activeMenu === "rewrite" && (
            <div role="menu" className="rf-v4-popover">
              <div className="rf-v4-popover-title">Rewrite as</div>

              <div className="rf-v4-popover-grid">
                {rewriteModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="menuitem"
                    onClick={() => handleRewrite(mode)}
                  >
                    <span>{mode}</span>
                    <span>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rf-v4-popover-anchor">
          <button
            type="button"
            onClick={() =>
              setActiveMenu((current) =>
                current === "translate" ? null : "translate"
              )
            }
            disabled={!reply || isBusy}
            className={activeMenu === "translate" ? "is-active" : ""}
            aria-expanded={activeMenu === "translate"}
            aria-haspopup="menu"
          >
            ◎ Translate <span>⌄</span>
          </button>

          {activeMenu === "translate" && (
            <div role="menu" className="rf-v4-popover">
              <div className="rf-v4-popover-title">Translate to</div>

              <div className="rf-v4-popover-grid">
                {languages.map((language) => (
                  <button
                    key={language}
                    type="button"
                    role="menuitem"
                    onClick={() => handleTranslate(language)}
                  >
                    <span>{language}</span>
                    <span>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {quickTools.map(([id, icon, label], index) => (
          <button
            key={id}
            type="button"
            onClick={() => handleQuickTool(id)}
            disabled={!reply || isBusy}
            className={`${index === 0 ? "rf-v4-mobile-primary-tool" : "rf-v4-mobile-secondary-tool"} ${toolLoading === id ? "is-loading" : ""}`}
          >
            <span>{toolLoading === id ? "…" : icon}</span>
            {label}
          </button>
        ))}

        <div className="rf-v4-popover-anchor rf-v4-mobile-more">
          <button
            type="button"
            onClick={() =>
              setActiveMenu((current) =>
                current === "more" ? null : "more"
              )
            }
            disabled={!reply || isBusy}
            className={activeMenu === "more" ? "is-active" : ""}
            aria-expanded={activeMenu === "more"}
            aria-haspopup="menu"
          >
            ••• More actions <span>⌄</span>
          </button>

          {activeMenu === "more" && (
            <div role="menu" className="rf-v4-popover rf-v4-mobile-more-popover">
              <div className="rf-v4-popover-title">More actions</div>

              <div className="rf-v4-popover-grid">
                {quickTools.slice(1).map(([id, icon, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleQuickTool(id)}
                    disabled={!reply || isBusy}
                  >
                    <span>{toolLoading === id ? "…" : icon} {label}</span>
                    <span>→</span>
                  </button>
                ))}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActiveMenu(null);
                    handleDownload();
                  }}
                  disabled={!reply || isBusy}
                >
                  <span>↓ Export</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rf-v4-toolbar-spacer" />

        <button
          type="button"
          onClick={handleDownload}
          disabled={!reply || isBusy}
          className="rf-v4-mobile-secondary-tool"
        >
          ↓ Export
        </button>
      </div>

      <div ref={replyContentRef} className="rf-v4-reply-document">
        {reply ? (
          <div
            className={`rf-v4-editable-reply ${streaming ? "is-streaming" : ""}`}
            contentEditable={!isBusy}
            suppressContentEditableWarning
            onBlur={(event) => {
              const nextText = event.currentTarget.innerText;
              if (nextText !== reply) setReply(nextText);
            }}
          >
            {reply}
          </div>
        ) : (
          <div className="rf-v4-empty-reply">
            <div className="rf-v4-empty-icon">✦</div>
            <h3>Your polished response will appear here</h3>
            <p>
              Paste the incoming message, select the right voice, and generate.
            </p>
          </div>
        )}

        {isBusy && !streaming && (
          <div className="rf-v4-reply-loading">
            <div className="rf-v4-loading-orb">✦</div>
            <strong>{loadingText}</strong>
            <span>ReplyForge is refining the language and tone.</span>
          </div>
        )}
      </div>

      {showScrollLatest && (
        <button
          type="button"
          onClick={()=>{
            const el=replyContentRef.current;
            if(!el) return;
            autoFollowRef.current=true;
            el.scrollTo({top:el.scrollHeight,behavior:"smooth"});
            setShowScrollLatest(false);
          }}
          style={{position:"fixed",right:"32px",bottom:"96px",zIndex:60,padding:"10px 14px",borderRadius:"999px"}}
        >
          ↓ Latest
        </button>
      )}

      <footer className="rf-v4-reply-footer">
        <button
          type="button"
          onClick={regenerateReply}
          disabled={!reply || isBusy}
        >
          ↻ Regenerate
        </button>

        <span className="rf-v4-edit-hint">Click the reply text to edit it directly</span>

        {versions.length > 1 && (
          <div className="rf-v4-version-nav">
            <button
              type="button"
              onClick={() => selectVersion(currentVersion - 1)}
              disabled={currentVersion <= 0 || isBusy}
              aria-label="Previous version"
            >
              ←
            </button>

            <span>
              {currentVersion + 1} of {versions.length}
            </span>

            <button
              type="button"
              onClick={() => selectVersion(currentVersion + 1)}
              disabled={currentVersion >= versions.length - 1 || isBusy}
              aria-label="Next version"
            >
              →
            </button>
          </div>
        )}
      </footer>
    </section>
  );
}

export default ReplyBox;
