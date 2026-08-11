import { useEffect, useRef, useState } from "react";

import Header from "./components/Header";
import ConversationMode from "./components/ConversationMode";
import MessageInput from "./components/MessageInput";
import Controls from "./components/Controls";
import ButtonGroup from "./components/ButtonGroup";
import ReplyBox from "./components/ReplyBox";
import ReplyScore from "./components/ReplyScore";
import Sidebar from "./components/Sidebar";
import HistoryList from "./components/HistoryList";
import AuthPage from "./components/AuthPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import LegalPage from "./components/LegalPage";
import PublicHomePage from "./components/PublicHomePage";
import ExtensionPage from "./components/ExtensionPage";
import AIProviderModal from "./components/AIProviderModal";
import PWAInstallButton from "./components/PWAInstallButton";
import ResponsiveAccountMenu from "./components/ResponsiveAccountMenu";
import MobileCoachSheet from "./components/MobileCoachSheet";

import { getAiProviderStatus } from "./services/aiService";
import { runReplyGeneration } from "./services/replyEngine";
import {
  rewriteReply,
  translateReply,
  runReplyTool,
} from "./services/aiToolsEngine";
import {
  addConversationTurn as addConversationTurnToState,
  updateConversationTurn as updateConversationTurnInState,
  deleteConversationTurn as deleteConversationTurnFromState,
  appendGeneratedConversationReply,
  getConversationModeState,
  clearConversationWorkspace,
} from "./services/conversationEngine";
import {
  analyzeReplyWithCoach,
} from "./services/aiCoachEngine";
import { analyzeIntent } from "./services/intentEngine";
import supabase from "./lib/supabase";

import {
  convertCloudItem,
  loadHistoryBundle,
  toggleHistoryFavorite,
  removeHistoryItem,
  filterHistoryItems,
} from "./services/historyManager";
import {
  getProviderPreference,
  saveProviderPreference,
} from "./services/providerManager";
import {
  createWorkspaceSnapshot,
  saveWorkspace,
  loadWorkspace,
  clearSavedWorkspace,
} from "./services/workspaceManager";
import {
  getTodayUsage,
  recordUsage,
} from "./services/usageManager";

function getSavedData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [session, setSession] = useState(null);
  const [extensionStatus, setExtensionStatus] = useState({
    installed: false,
    version: "",
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(() =>
    new URLSearchParams(window.location.search).has("reset-password")
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState(() =>
    getAiProviderStatus()
  );

  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [mobileCoachOpen, setMobileCoachOpen] = useState(false);
  const [providerPreference, setProviderPreference] = useState(() =>
    getProviderPreference()
  );

  const [usageStats, setUsageStats] = useState(() =>
    getTodayUsage()
  );

  const [initialWorkspace] = useState(loadWorkspace);
  const [message, setMessage] = useState(initialWorkspace.message);
  const [reply, setReply] = useState(initialWorkspace.reply);
  const [conversationMode, setConversationMode] = useState(
    initialWorkspace.conversationMode
  );
  const [conversation, setConversation] = useState(
    initialWorkspace.conversation
  );

  const [tone, setTone] = useState(initialWorkspace.tone);
  const [length, setLength] = useState(initialWorkspace.length);
  const [language, setLanguage] = useState(initialWorkspace.language);
  const [persona, setPersona] = useState(initialWorkspace.persona);

  const [loading, setLoading] = useState(false);
  const streamControllerRef = useRef(null);
  const workspacePrimaryRef = useRef(null);
  const replySectionRef = useRef(null);
  const replyAutoScrollDoneRef = useRef(false);
  const workspaceSaveTimerRef = useRef(null);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [coachFixLoading, setCoachFixLoading] = useState(false);
  const [coachFixError, setCoachFixError] = useState("");
  const [replyScore, setReplyScore] = useState(
    initialWorkspace.replyScore
  );

  function scrollWorkspaceTo(target, behavior = "smooth") {
    if (!target) return;

    if (window.matchMedia("(max-width: 900px)").matches) {
      const targetTop =
        window.scrollY +
        target.getBoundingClientRect().top -
        10;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior,
      });
      return;
    }

    const container = workspacePrimaryRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const nextTop =
      container.scrollTop +
      targetRect.top -
      containerRect.top -
      10;

    container.scrollTo({
      top: Math.max(0, nextTop),
      behavior,
    });
  }
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("history");
  const [toolLoading, setToolLoading] = useState("");
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentResult, setIntentResult] = useState(
    initialWorkspace.intentResult
  );

  const [history, setHistory] = useState([]);
  const [customTemplates, setCustomTemplates] = useState(() =>
    getSavedData("replyforge-custom-templates", [])
  );

  const [favorites, setFavorites] = useState(() =>
    getSavedData("replyforge-favorites", [])
  );

  const [darkMode, setDarkMode] = useState(() =>
    getSavedData("replyforge-dark-mode", true)
  );

  useEffect(() => {
    function detectReplyForgeExtension() {
      const version =
        document.documentElement.getAttribute(
          "data-replyforge-extension-version"
        ) || "";

      if (version) {
        setExtensionStatus({ installed: true, version });
      }
    }

    window.addEventListener(
      "replyforge:extension-ready",
      detectReplyForgeExtension
    );

    detectReplyForgeExtension();
    window.dispatchEvent(new Event("replyforge:extension-ping"));

    const retryTimer = window.setTimeout(() => {
      window.dispatchEvent(new Event("replyforge:extension-ping"));
      detectReplyForgeExtension();
    }, 700);

    return () => {
      window.clearTimeout(retryTimer);
      window.removeEventListener(
        "replyforge:extension-ready",
        detectReplyForgeExtension
      );
    };
  }, []);

  useEffect(() => {
    window.clearTimeout(
      workspaceSaveTimerRef.current
    );

    workspaceSaveTimerRef.current =
      window.setTimeout(() => {
        saveWorkspace(
          createWorkspaceSnapshot({
            message,
            reply,
            conversationMode,
            conversation,
            tone,
            length,
            language,
            persona,
            intentResult,
            replyScore,
          })
        );
      }, 250);

    return () => {
      window.clearTimeout(
        workspaceSaveTimerRef.current
      );
    };
  }, [
    message,
    reply,
    conversationMode,
    conversation,
    tone,
    length,
    language,
    persona,
    intentResult,
    replyScore,
  ]);

  useEffect(() => {
    async function loadSession() {
      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        setSession(currentSession);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load session.");
      } finally {
        setAuthLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
      }

      setSession(newSession);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function loadHistoryFromCloud() {
      if (!session?.user?.id) {
        setHistory([]);
        setFavorites([]);
        return;
      }

      try {
        setHistoryLoading(true);
        setError("");

        const result =
          await loadHistoryBundle();

        setHistory(
          result.history
        );

        setFavorites(
          result.favorites
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.message ||
            "Cloud history could not be loaded."
        );
      } finally {
        setHistoryLoading(false);
      }
    }

    loadHistoryFromCloud();
  }, [session?.user?.id]);

  useEffect(() => {
    localStorage.setItem(
      "replyforge-favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      "replyforge-dark-mode",
      JSON.stringify(darkMode)
    );

    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);


  function trackUsage(action) {
    const provider = getAiProviderStatus();
    setProviderStatus(provider);
    const next = recordUsage(
      action,
      provider?.online ? provider.id : ""
    );
    setUsageStats(next);
  }

  async function createReply(action) {
    try {
      setLoading(true);
      setError("");
      replyAutoScrollDoneRef.current = false;

      streamControllerRef.current?.abort();

      const controller =
        new AbortController();

      streamControllerRef.current =
        controller;

      setReply("");

      const result =
        await runReplyGeneration({
          action,
          session,
          message,
          conversationMode,
          conversation,
          tone,
          length,
          language,
          persona,
          signal:
            controller.signal,
          onText: (fullText) => {
            setReply(fullText);

            if (!replyAutoScrollDoneRef.current) {
              replyAutoScrollDoneRef.current = true;
              requestAnimationFrame(() => {
                scrollWorkspaceTo(replySectionRef.current);
              });
            }
          },
        });

      setReply(result.cleanReply);
      setReplyScore(null);

      if (conversationMode) {
        setConversation(
          (current) =>
            appendGeneratedConversationReply({
              conversation: current,
              cleanMessage:
                result.cleanMessage,
              cleanReply:
                result.cleanReply,
              isRegenerate:
                result.isRegenerate,
            })
        );

        if (!result.isRegenerate) {
          setMessage("");
        }
      }

      const formattedItem = {
        ...convertCloudItem(
          result.savedItem
        ),
        length,
        language,
      };

      setHistory(
        (current) => [
          formattedItem,
          ...current,
        ]
      );
      trackUsage("generate");
    } catch (err) {
      if (
        err?.name ===
        "AbortError"
      ) {
        setError("");
        return;
      }

      console.error(err);

      const errorMessage =
        err?.message || "";

      if (
        errorMessage.includes(
          "rate limit"
        ) ||
        errorMessage.includes(
          "429"
        )
      ) {
        setError(
          "The free AI service is temporarily rate-limited. Please wait a moment and try again."
        );
      } else {
        setError(
          errorMessage ||
            "Unable to generate reply."
        );
      }
    } finally {
      streamControllerRef.current =
        null;
      setLoading(false);
    }
  }

  async function analyzeMessageIntent() {
    try {
      setIntentLoading(true);
      setError("");

      const analysis =
        await analyzeIntent({
          message,
        });

      setIntentResult(
        analysis.result
      );
      trackUsage("intent");

      setTone(
        analysis.mappedTone
      );

      setPersona(
        analysis.mappedPersona
      );

      if (
        analysis.mappedLanguage
      ) {
        setLanguage(
          analysis.mappedLanguage
        );
      }
    } catch (err) {
      console.error(
        "Intent detection error:",
        err
      );

      setError(
        err?.message ||
          "Unable to analyze this message."
      );
    } finally {
      setIntentLoading(false);
    }
  }

  function stopGeneration() {
    streamControllerRef.current?.abort();
  }

  async function rewriteCurrentReply(mode) {
    if (!session?.user?.id) {
      setError("Please login again.");
      return;
    }

    try {
      setRewriteLoading(true);
      setError("");

      const rewrittenReply =
        await rewriteReply({
          reply,
          mode,
          length,
          language,
          persona,
        });

      setReply(rewrittenReply);
      setReplyScore(null);
      trackUsage("rewrite");
    } catch (err) {
      console.error(
        "Rewrite error:",
        err
      );

      setError(
        err?.message ||
          "Reply could not be rewritten."
      );
    } finally {
      setRewriteLoading(false);
    }
  }

async function translateCurrentReply(
  targetLanguage
) {
  if (!session?.user?.id) {
    setError("Please login again.");
    return;
  }

  try {
    setTranslateLoading(true);
    setError("");

    const translatedReply =
      await translateReply({
        reply,
        targetLanguage,
        length,
        persona,
      });

    setReply(translatedReply);
    setReplyScore(null);
    trackUsage("translate");
  } catch (err) {
    console.error(
      "Translation error:",
      err
    );

    setError(
      err?.message ||
        "Reply could not be translated."
    );
  } finally {
    setTranslateLoading(false);
  }
}

async function analyzeReply() {
  if (!session?.user?.id) {
    setError("Please login again.");
    return;
  }

  try {
    setScoreLoading(true);
    setError("");
    setReplyScore(null);

    const score =
      await analyzeReplyWithCoach({
        reply,
      });

    setReplyScore(score);
    trackUsage("coach");
  } catch (err) {
    console.error(
      "Reply score error:",
      err
    );

    setError(
      err?.message ||
        "Unable to analyze the reply."
    );
  } finally {
    setScoreLoading(false);
  }
}

async function applyCoachFixes() {
  if (!replyScore?.suggestions?.length || coachFixLoading) return;

  try {
    setCoachFixLoading(true);
    setError("");
    setCoachFixError("");

    const feedback = replyScore.suggestions
      .filter(Boolean)
      .slice(0, 5)
      .map((suggestion) => `- ${suggestion}`)
      .join("\n");

    // Use the same rewrite pipeline as the working reply toolbar actions.
    const improvedReply = await runReplyTool({
      tool: "coachFix",
      reply,
      tone,
      length,
      language,
      persona,
      customInstruction: `Improve this reply using the AI Coach feedback below. Keep every essential fact accurate. Return only the improved reply, without headings, notes or quotation marks.\n\nAI Coach feedback:\n${feedback}`,
    });

    setReply(improvedReply);
    setReplyScore(null);
    trackUsage("coachFix");

    requestAnimationFrame(() => {
      scrollWorkspaceTo(replySectionRef.current);
    });
  } catch (err) {
    const message = err?.message || "Coach fixes could not be applied.";
    setCoachFixError(message);
    setError(message);
  } finally {
    setCoachFixLoading(false);
  }
}

function saveCurrentAsTemplate() {
  const text = String(message || reply || "").trim();

  if (!text) {
    setError("Write a message or generate a reply before saving a template.");
    return;
  }

  const title = window.prompt("Template name", "My template");
  if (!title?.trim()) return;

  setCustomTemplates((current) => {
    const next = [
      {
        id: `${Date.now()}-${Math.random()}`,
        title: title.trim(),
        description: "Your saved custom template.",
        tone,
        text,
        custom: true,
      },
      ...current,
    ];
    localStorage.setItem("replyforge-custom-templates", JSON.stringify(next));
    return next;
  });
}

function deleteCustomTemplate(id) {
  setCustomTemplates((current) => {
    const next = current.filter((template) => template.id !== id);
    localStorage.setItem("replyforge-custom-templates", JSON.stringify(next));
    return next;
  });
}

async function runAiTool(tool) {
  try {
    setToolLoading(tool);
    setError("");

    const improvedReply =
      await runReplyTool({
        tool,
        reply,
        tone,
        length,
        language,
        persona,
      });

    setReply(improvedReply);
    setReplyScore(null);
    trackUsage(tool);
  } catch (err) {
    console.error(
      "AI tool error:",
      err
    );

    setError(
      err?.message ||
        "AI tool could not complete the request."
    );
  } finally {
    setToolLoading("");
  }
}

  async function toggleFavorite(id) {
    try {
      setError("");

      const result =
        await toggleHistoryFavorite({
          history,
          id,
        });

      if (!result) {
        return;
      }

      setHistory(
        result.history
      );

      setFavorites(
        result.favorites
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Favorite could not be updated."
      );
    }
  }

  async function deleteHistoryItem(id) {
    try {
      setError("");

      const result =
        await removeHistoryItem({
          history,
          id,
          currentReply: reply,
        });

      if (!result) {
        return;
      }

      setHistory(
        result.history
      );

      setFavorites(
        result.favorites
      );

      if (
        result.shouldClearReply
      ) {
        setReply("");
      }
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "History item could not be deleted."
      );
    }
  }

  async function handleLogout() {
    try {
      setError("");

      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      setSession(null);
      setMessage("");
      setReply("");
      setHistory([]);
      setFavorites([]);
      setSearch("");
      setPersona("Professional");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to logout.");
    }
  }

  function addConversationTurn(
    role,
    text = message
  ) {
    const cleanText =
      text.trim();

    if (!cleanText) {
      return;
    }

    setConversation(
      (current) =>
        addConversationTurnToState(
          current,
          role,
          cleanText
        )
    );

    setMessage("");
    setError("");
  }

  function updateConversationTurn(
    id,
    text
  ) {
    setConversation(
      (current) =>
        updateConversationTurnInState(
          current,
          id,
          text
        )
    );
  }

  function deleteConversationTurn(
    id
  ) {
    setConversation(
      (current) =>
        deleteConversationTurnFromState(
          current,
          id
        )
    );
  }

  function switchWorkspaceMode(
    nextMode
  ) {
    const state =
      getConversationModeState(
        nextMode
      );

    setConversationMode(
      state.conversationMode
    );
    setError(state.error);
    setReply(state.reply);
    setReplyScore(
      state.replyScore
    );
  }

  function clearAll() {
    const state =
      clearConversationWorkspace();

    clearSavedWorkspace();

    setMessage(state.message);
    setReply(state.reply);
    setConversation(
      state.conversation
    );
    setReplyScore(
      state.replyScore
    );
    setIntentResult(
      state.intentResult
    );
    setError(state.error);
  }

  const filteredHistory =
    filterHistoryItems({
      history,
      search,
    });

  function finishPasswordRecovery() {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
    setSession(null);
    setPasswordRecovery(false);
  }

  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const extensionView = new URLSearchParams(window.location.search).get("view") === "extension";
  const legalPageType =
    currentPath === "/privacy"
      ? "privacy"
      : currentPath === "/terms"
        ? "terms"
        : "";

  if (currentPath === "/about") {
    return <PublicHomePage />;
  }

  if (currentPath === "/extension" || extensionView) {
    return <ExtensionPage />;
  }

  if (legalPageType) {
    return <LegalPage type={legalPageType} />;
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />

          <p className="mt-4 font-medium text-white">
            Loading ReplyForge AI...
          </p>
        </div>
      </div>
    );
  }

  if (passwordRecovery) {
    return <ResetPasswordPage onComplete={finishPasswordRecovery} />;
  }

  if (!session) {
    return <AuthPage />;
  }

  const userName =
    session.user.user_metadata?.full_name ||
    session.user.email?.split("@")[0] ||
    "User";

  return (
    <div className="rf-v4-app">
      <div className="rf-v4-shell">
        <Sidebar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          favorites={favorites}
          setFavorites={setFavorites}
          search={search}
          setSearch={setSearch}
          history={history}
          usageStats={usageStats}
          setMessage={setMessage}
          setTone={setTone}
          onOpenHistory={() => {
            setDrawerMode("history");
            setHistoryOpen(true);
          }}
          onOpenFavorites={() => {
            setDrawerMode("favorites");
            setHistoryOpen(true);
          }}
          onOpenTemplates={() => {
            setDrawerMode("templates");
            setHistoryOpen(true);
          }}
          onOpenTools={() => {
            scrollWorkspaceTo(
              document.getElementById("reply-actions")
            );
          }}
          onOpenCoach={() => setMobileCoachOpen(true)}
          onNewReply={clearAll}
          userName={userName}
          userEmail={session.user.email}
          onLogout={handleLogout}
          providerStatus={providerStatus}
          providerPreference={providerPreference}
          onOpenProvider={() => setProviderModalOpen(true)}
        />

        <div className="rf-v4-main-column">
          <header className="rf-v4-topbar">
            <div className="rf-v4-mobile-brand">
              <span>R</span>
              ReplyForge
            </div>
            <div className="rf-v4-mobile-account-actions">
              <PWAInstallButton />
              <ResponsiveAccountMenu
                userName={userName}
                userEmail={session.user.email}
                usageStats={usageStats}
                onLogout={handleLogout}
              />
            </div>
          </header>

          <main className="rf-v4-workspace">
            <div ref={workspacePrimaryRef} className="rf-v4-workspace-primary">
              <section className={`rf-extension-dashboard-banner${extensionStatus.installed ? " is-installed" : ""}`}>
                <div className="rf-extension-dashboard-copy"><span>{extensionStatus.installed ? "READY" : "NEW"}</span><strong>{extensionStatus.installed ? "ReplyForge extension is connected" : "Reply directly inside Gmail, WhatsApp and LinkedIn"}</strong><p>{extensionStatus.installed ? "Open Gmail, WhatsApp Web or LinkedIn and use ReplyForge from the Chrome side panel." : "Use your same ReplyForge account and daily allowance in the Chrome extension."}</p></div>
                <div className="rf-extension-dashboard-actions">
                  {extensionStatus.installed ? (
                    <span className="rf-extension-installed-badge">✓ Extension installed <small>v{extensionStatus.version}</small></span>
                  ) : (
                    <a href="/?view=extension">Get the extension <b>→</b></a>
                  )}
                </div>
              </section>
              <section className="rf-v4-compose-panel">
                <Header />

                <div className="rf-v4-mode-switch" role="tablist" aria-label="Reply mode">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!conversationMode}
                    className={!conversationMode ? "is-active" : ""}
                    onClick={() => switchWorkspaceMode("single")}
                  >
                    <span>✦</span>
                    Single reply
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={conversationMode}
                    className={conversationMode ? "is-active" : ""}
                    onClick={() => switchWorkspaceMode("conversation")}
                  >
                    <span>◌</span>
                    Conversation
                    {conversation.length > 0 && (
                      <em>{conversation.length}</em>
                    )}
                  </button>
                </div>

                {conversationMode ? (
                  <ConversationMode
                    conversation={conversation}
                    draft={message}
                    setDraft={setMessage}
                    addTurn={addConversationTurn}
                    updateTurn={updateConversationTurn}
                    deleteTurn={deleteConversationTurn}
                    loading={loading}
                  />
                ) : (
                  <MessageInput message={message} setMessage={setMessage} />
                )}

                <Controls
                  tone={tone}
                  setTone={setTone}
                  length={length}
                  setLength={setLength}
                  language={language}
                  setLanguage={setLanguage}
                  persona={persona}
                  setPersona={setPersona}
                />

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    marginTop: "10px",
                    border: "1px solid var(--rf-v4-border)",
                    borderRadius: "12px",
                    background: "var(--rf-v4-surface)",
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      minWidth: 0,
                      flex: "1 1 420px",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <strong
                        style={{
                          color: "var(--rf-v4-text)",
                          fontSize: "9px",
                        }}
                      >
                        AI message detection
                      </strong>

                      {intentResult && (
                        <>
                          <span className="rf-v4-private-badge">
                            {intentResult.intent}
                          </span>

                          <span className="rf-v4-private-badge">
                            {intentResult.messageType}
                          </span>

                          <span
                            style={{
                              color: "var(--rf-v4-purple)",
                              fontSize: "8px",
                              fontWeight: 700,
                            }}
                          >
                            {intentResult.confidence}% confidence
                          </span>
                        </>
                      )}
                    </div>

                    <span
                      style={{
                        color: "var(--rf-v4-faint)",
                        fontSize: "8px",
                        lineHeight: 1.45,
                      }}
                    >
                      {intentResult?.summary ||
                        "Detect the intent and message type, then apply suitable tone and persona settings."}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={analyzeMessageIntent}
                    disabled={intentLoading || loading || !message.trim()}
                    className="rf-v4-analyze-button"
                  >
                    {intentLoading
                      ? "Detecting…"
                      : intentResult
                        ? "Detect again"
                        : "Detect message"}
                  </button>
                </div>

                <ButtonGroup
  createReply={createReply}
  stopGeneration={stopGeneration}
  loading={loading}
  clearAll={clearAll}
  providerName={providerStatus?.label || "AI"}
/>
                {error && (
                  <div className="rf-v4-error" role="alert">
                    <span>!</span>
                    {error}
                  </div>
                )}
              </section>

              <div ref={replySectionRef}>
                <ReplyBox
                  reply={reply}
                  setReply={setReply}
                  rewriteReply={rewriteCurrentReply}
                  rewriteLoading={rewriteLoading}
                  translateReply={translateCurrentReply}
                  translateLoading={translateLoading}
                  regenerateReply={() => createReply("regenerate")}
                  generateLoading={loading}
                  streaming={loading}
                  runAiTool={runAiTool}
                  toolLoading={toolLoading}
                />
              </div>
            </div>

            <aside className="rf-v4-insights-column">
              <ReplyScore
                replyScore={replyScore}
                scoreLoading={scoreLoading}
                analyzeReply={analyzeReply}
                applyCoachFixes={applyCoachFixes}
                coachFixLoading={coachFixLoading}
                coachFixError={coachFixError}
              />

              <section className="rf-v4-side-card">
                <div className="rf-v4-side-card-heading">
                  <span className="rf-v4-side-icon">◷</span>
                  <div>
                    <strong>Recent activity</strong>
                    <span>{history.length} replies saved</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDrawerMode("history");
                    setHistoryOpen(true);
                  }}
                  className="rf-v4-side-link"
                >
                  Open reply history
                  <span>→</span>
                </button>
              </section>

              <section className="rf-v4-side-card rf-v4-tip-card">
                <span className="rf-v4-tip-label">Pro tip</span>
                <strong>Make every reply sound like you.</strong>
                <p>
                  Choose a persona before generating to keep tone consistent.
                </p>

                <div className="rf-v4-tip-personas">
                  <span>CEO</span>
                  <span>Friendly</span>
                  <span>Support</span>
                </div>
              </section>

              <section className="rf-v4-side-card rf-v4-privacy-card">
                <span>⌁</span>
                <div>
                  <strong>Privacy-first workspace</strong>
                  <p>Your drafts remain inside your ReplyForge account.</p>
                </div>
              </section>
            </aside>
          </main>
        </div>
      </div>
      <MobileCoachSheet
        open={mobileCoachOpen}
        onClose={() => setMobileCoachOpen(false)}
        replyScore={replyScore}
        scoreLoading={scoreLoading}
        analyzeReply={analyzeReply}
        applyCoachFixes={applyCoachFixes}
        coachFixLoading={coachFixLoading}
        coachFixError={coachFixError}
      />
      <AIProviderModal
        open={providerModalOpen}
        providerStatus={providerStatus}
        preference={providerPreference}
        onPreferenceChange={(nextPreference) => {
          const saved = saveProviderPreference(nextPreference);
          setProviderPreference(saved);
          setProviderStatus(getAiProviderStatus());
        }}
        onClose={() => setProviderModalOpen(false)}
      />

{historyOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]"
    onClick={() => setHistoryOpen(false)}
  >
    <div
      className="w-full overflow-y-auto rounded-2xl bg-[#f8f9fd] p-4 shadow-2xl dark:bg-[#080d18]"
      style={{
        width: "min(420px, calc(100vw - 32px))",
        maxWidth: "420px",
        maxHeight: "78vh",
      }}
      onClick={(event) => event.stopPropagation()}
    >
      
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">
                  {drawerMode === "favorites"
                    ? "Favorite Replies"
                    : drawerMode === "templates"
                      ? "Reply Templates"
                      : "Reply History"}
                </h2>
                <p className="text-xs text-slate-500">
                  {drawerMode === "favorites"
                    ? `${filteredHistory.filter((item) => item.isFavorite).length} favorite replies`
                    : drawerMode === "templates"
                      ? "Choose a template to start your reply"
                      : `${filteredHistory.length} saved replies`}
                </p>
              </div>

              <button
                onClick={() => setHistoryOpen(false)}
                className="h-10 w-10 rounded-xl border border-slate-200 bg-white font-black dark:border-white/10 dark:bg-white/[.04]"
              >
                ✕
              </button>
            </div>

            {drawerMode === "templates" ? (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">Use a ready template or save your own.</span>
                  <button
                    type="button"
                    onClick={saveCurrentAsTemplate}
                    className="rf-v4-analyze-button"
                  >
                    + Save current
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Professional reply",
                    description: "Clear, polished and workplace-ready.",
                    tone: "Professional",
                    text: "Thank you for your message. I appreciate you reaching out. I’ll review the details and get back to you with a clear update shortly.",
                  },
                  {
                    title: "Friendly reply",
                    description: "Warm, natural and conversational.",
                    tone: "Friendly",
                    text: "Thanks so much for your message! I really appreciate you reaching out. I’ll take a look and get back to you soon.",
                  },
                  {
                    title: "Polite decline",
                    description: "Say no without sounding rude.",
                    tone: "Formal",
                    text: "Thank you for considering me. Unfortunately, I won’t be able to proceed at this time, but I truly appreciate the opportunity.",
                  },
                  {
                    title: "Follow-up",
                    description: "A gentle reminder that gets attention.",
                    tone: "Professional",
                    text: "Just following up on my previous message. Please let me know when you have a moment to review it. I’d appreciate an update.",
                  },
                  {
                    title: "Apology",
                    description: "Take responsibility with the right tone.",
                    tone: "Professional",
                    text: "I sincerely apologize for the inconvenience. I understand the impact this may have caused, and I’m working to resolve it as quickly as possible.",
                  },
                  {
                    title: "Customer support",
                    description: "Helpful, reassuring and action-focused.",
                    tone: "Friendly",
                    text: "I’m sorry you experienced this issue. I’m looking into it now and will help you reach the best possible resolution.",
                  },
                  ...customTemplates,
                ].map((template) => (
                  <button
                    key={template.title}
                    type="button"
                    onClick={() => {
                      setMessage(template.text);
                      setTone(template.tone);
                      setHistoryOpen(false);
                    }}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[.04]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black">{template.title}</h3>
                      {template.custom ? (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteCustomTemplate(template.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              deleteCustomTemplate(template.id);
                            }
                          }}
                          className="text-xs text-rose-500"
                        >
                          Delete
                        </span>
                      ) : (
                        <span className="text-violet-600">→</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {template.description}
                    </p>
                    <p className="mt-3 line-clamp-3 text-[11px] leading-5 text-slate-600 dark:text-slate-300">
                      {template.text}
                    </p>
                  </button>
                ))}
                </div>
              </div>
            ) : historyLoading ? (
              <p>Loading cloud history...</p>
            ) : (
              <HistoryList
                history={
                  drawerMode === "favorites"
                    ? filteredHistory.filter((item) => item.isFavorite)
                    : filteredHistory
                }
                setReply={setReply}
                setMessage={setMessage}
                deleteHistoryItem={deleteHistoryItem}
                toggleFavorite={toggleFavorite}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
