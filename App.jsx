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
import FavoriteButton from "./components/FavoriteButton";
import AITools from "./components/AITools";
import AuthPage from "./components/AuthPage";

import { generateReply, streamReply } from "./services/aiService";
import { buildSmartReplyPrompt } from "./services/promptBuilder";
import supabase from "./lib/supabase";

import {
  getCloudHistory,
  saveReplyToCloud,
  updateCloudFavorite,
  deleteCloudHistory,
} from "./services/history";

function getSavedData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function convertCloudItem(item) {
  return {
    id: item.id,
    message: item.original_message,
    reply: item.generated_reply,
    tone: item.tone || "Professional",
    length: "Medium",
    language: "English",
    isFavorite: Boolean(item.is_favorite),
    createdAt: item.created_at,
    cloudSaved: true,
  };
}

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [conversationMode, setConversationMode] = useState(false);
  const [conversation, setConversation] = useState([]);

  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [persona, setPersona] = useState("Professional");

  const [loading, setLoading] = useState(false);
  const streamControllerRef = useRef(null);
  const replySectionRef = useRef(null);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);
const [replyScore, setReplyScore] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("history");
  const [toolLoading, setToolLoading] = useState("");

  const [history, setHistory] = useState([]);

  const [favorites, setFavorites] = useState(() =>
    getSavedData("replyforge-favorites", [])
  );

  const [darkMode, setDarkMode] = useState(() =>
    getSavedData("replyforge-dark-mode", true)
  );

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
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
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

        const cloudHistory = await getCloudHistory();
        const formattedHistory = cloudHistory.map(convertCloudItem);

        setHistory(formattedHistory);

        const cloudFavorites = formattedHistory
          .filter((item) => item.isFavorite)
          .map((item) => item.reply);

        setFavorites(cloudFavorites);
      } catch (err) {
        console.error(err);
        setError(err.message || "Cloud history could not be loaded.");
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

  async function createReply(action) {
    const isRegenerate = action === "regenerate";
    const cleanMessage = message.trim();
    const hasConversation = conversationMode && conversation.length > 0;

    if (!cleanMessage && !hasConversation) {
      setError(
        conversationMode
          ? "Add at least one conversation message before generating a reply."
          : "Please enter a message before generating a reply."
      );
      return;
    }

    if (!session?.user?.id) {
      setError("Please login again.");
      return;
    }

    const conversationWithDraft = conversationMode
      ? [
          ...conversation,
          ...(cleanMessage
            ? [{ id: `draft-${Date.now()}`, role: "customer", text: cleanMessage }]
            : []),
        ]
      : [];

    const latestIncomingMessage = conversationMode
      ? [...conversationWithDraft]
          .reverse()
          .find((turn) => turn.role === "customer")?.text || cleanMessage
      : cleanMessage;

    const promptMessage = buildSmartReplyPrompt({
      message: cleanMessage,
      conversation: conversationWithDraft,
      conversationMode,
      tone,
      length,
      language,
      persona,
      isRegenerate,
    });

    try {
      setLoading(true);
      setError("");

      streamControllerRef.current?.abort();
      const controller = new AbortController();
      streamControllerRef.current = controller;

      let streamedReply = "";
      setReply("");

      const generatedReply = await streamReply(
        promptMessage,
        tone,
        length,
        language,
        persona,
        {
          signal: controller.signal,
          onText: (fullText) => {
            streamedReply = fullText;
            setReply(fullText);

            requestAnimationFrame(() => {
              replySectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            });
          },
        }
      );

      if (!generatedReply?.trim()) {
        throw new Error("No reply was generated.");
      }

      const cleanReply = generatedReply.trim();
      setReply(cleanReply);
      setReplyScore(null);

      if (conversationMode) {
        setConversation((current) => {
          const withoutLastAssistant = isRegenerate && current.at(-1)?.role === "assistant"
            ? current.slice(0, -1)
            : current;

          const next = [...withoutLastAssistant];

          if (cleanMessage && !isRegenerate) {
            next.push({
              id: `customer-${Date.now()}`,
              role: "customer",
              text: cleanMessage,
            });
          }

          next.push({
            id: `assistant-${Date.now() + 1}`,
            role: "assistant",
            text: cleanReply,
          });

          return next;
        });

        if (!isRegenerate) setMessage("");
      }

      const historyMessage = conversationMode
        ? conversationWithDraft
            .map((turn) => `${turn.role === "customer" ? "Customer" : "You"}: ${turn.text}`)
            .join("\n\n")
        : cleanMessage;

      const savedItem = await saveReplyToCloud({
        userId: session.user.id,
        originalMessage: historyMessage || latestIncomingMessage,
        generatedReply: cleanReply,
        tone,
      });

      const formattedItem = {
        ...convertCloudItem(savedItem),
        length,
        language,
      };

      setHistory((current) => [formattedItem, ...current]);
    } catch (err) {
      if (err?.name === "AbortError") {
        setError("");
        return;
      }

      console.error(err);

      const message = err?.message || "";

      if (
        message.includes("rate limit") ||
        message.includes("429")
      ) {
        setError(
          "The free AI service is temporarily rate-limited. Please wait a moment and try again."
        );
      } else {
        setError(message || "Unable to generate reply.");
      }
    } finally {
      streamControllerRef.current = null;
      setLoading(false);
    }
  }

  function stopGeneration() {
    streamControllerRef.current?.abort();
  }

  async function rewriteCurrentReply(mode) {
  const currentReply = reply.trim();

  if (!currentReply) {
    setError("Please generate a reply before using rewrite mode.");
    return;
  }

  if (!session?.user?.id) {
    setError("Please login again.");
    return;
  }

  try {
    setRewriteLoading(true);
    setError("");

    const rewriteInstructions = {
      Professional:
        "Rewrite this reply in a polished and professional tone.",
      Friendly:
        "Rewrite this reply in a warm, natural and friendly tone.",
      Funny:
        "Rewrite this reply in a light and funny tone without being offensive.",
      Shorter:
        "Make this reply shorter and more concise while preserving its meaning.",
      Longer:
        "Make this reply longer with useful details while keeping it clear.",
      "More Polite":
        "Rewrite this reply to sound more polite, respectful and considerate.",
      Business:
        "Rewrite this reply in a formal business communication style.",
      Stronger:
        "Rewrite this reply to sound confident, firm and persuasive without being rude.",
    };

    const instruction =
      rewriteInstructions[mode] ||
      "Rewrite this reply in a clearer and better way.";

    const rewritePrompt = `${instruction}

Return only the rewritten reply.
Do not include headings, explanations, notes or quotation marks.

Reply to rewrite:
${currentReply}`;

    const rewrittenReply = await generateReply(
      rewritePrompt,
      "Professional",
      length,
      language
    );

    if (!rewrittenReply?.trim()) {
      throw new Error("No rewritten reply was generated.");
    }

    setReply(rewrittenReply.trim());
  } catch (err) {
    console.error("Rewrite error:", err);
    setError(err.message || "Reply could not be rewritten.");
  } finally {
    setRewriteLoading(false);
  }
}
async function translateCurrentReply(targetLanguage) {
  if (!reply?.trim()) {
    setError("Please generate a reply first.");
    return;
  }

  if (!session?.user?.id) {
    setError("Please login again.");
    return;
  }

  try {
    setTranslateLoading(true);
    setError("");

    const translatePrompt = `Translate the following reply into ${targetLanguage}.

Preserve the original meaning, tone and formatting.
Return only the translated reply.
Do not include headings, explanations, notes or quotation marks.

Reply to translate:
${reply}`;

    const translatedReply = await generateReply(
      translatePrompt,
      "Professional",
      length,
      targetLanguage
    );

    if (!translatedReply?.trim()) {
      throw new Error("No translated reply was generated.");
    }

    setReply(translatedReply.trim());
    setReplyScore(null);
  } catch (err) {
    console.error("Translation error:", err);
    setError(err.message || "Reply could not be translated.");
  } finally {
    setTranslateLoading(false);
  }
}

async function analyzeReply() {
  const currentReply = reply.trim();

  if (!currentReply) {
    setError("Please generate a reply first.");
    return;
  }

  if (!session?.user?.id) {
    setError("Please login again.");
    return;
  }

  try {
    setScoreLoading(true);
    setError("");
    setReplyScore(null);

    const prompt = `You are ReplyForge AI Coach.

Analyze the reply below and return ONLY valid JSON.
Do not use markdown code blocks.
Do not add explanations before or after the JSON.

Use exactly this structure:

{
  "overall": 0,
  "grammar": 0,
  "clarity": 0,
  "professionalism": 0,
  "politeness": 0,
  "confidence": 0,
  "empathy": 0,
  "readability": 0,
  "aggressiveRisk": 0,
  "misunderstandingRisk": 0,
  "callToAction": 0,
  "verdict": "",
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ]
}

Scoring rules:
- Every score must be a whole number from 0 to 100.
- aggressiveRisk: 0 means completely safe and calm; 100 means highly aggressive or offensive.
- misunderstandingRisk: 0 means extremely clear; 100 means highly confusing or easy to misinterpret.
- callToAction: score how clear and useful the next step is. If no call to action is needed, score based on whether the reply ends appropriately.
- verdict must be one short sentence.
- suggestions must be specific, practical, and non-repetitive.

Reply to analyze:
${currentReply}`;

    const result = await generateReply(
      prompt,
      "Professional",
      "Medium",
      "English"
    );

    if (!result?.trim()) {
      throw new Error("No analysis was generated.");
    }

    const cleanResult = result
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const score = JSON.parse(cleanResult);

    setReplyScore(score);
  } catch (err) {
    console.error("Reply score error:", err);
    setError(err.message || "Unable to analyze the reply.");
  } finally {
    setScoreLoading(false);
  }
}

async function runAiTool(tool) {
  const currentReply = reply.trim();
  if (!currentReply) {
    setError("Please generate a reply first.");
    return;
  }

  const instructions = {
    grammar: "Fix all grammar, spelling and punctuation errors. Preserve the original meaning and tone.",
    humanize: "Rewrite this so it sounds natural, warm and genuinely human. Avoid robotic or overly formal wording.",
    shorten: "Make this reply shorter and more concise while keeping every important point.",
    expand: "Expand this reply with useful detail while keeping it clear and professional.",
    followup: "Create a natural follow-up reply based on this message.",
    email: "Format this reply as a polished email with an appropriate greeting, body and sign-off.",
  };

  try {
    setToolLoading(tool);
    setError("");
    const result = await generateReply(
      `${instructions[tool]}\n\nReturn only the improved reply. Do not add explanations or quotation marks.\n\nReply:\n${currentReply}`,
      tone,
      length,
      language,
      persona
    );
    if (!result?.trim()) throw new Error("No improved reply was generated.");
    setReply(result.trim());
    setReplyScore(null);
  } catch (err) {
    console.error(err);
    setError(err.message || "AI tool could not complete the request.");
  } finally {
    setToolLoading("");
  }
}

  async function toggleFavorite(id) {
    try {
      setError("");

      const selectedItem = history.find((item) => item.id === id);

      if (!selectedItem) {
        return;
      }

      const newFavoriteStatus = !selectedItem.isFavorite;

      await updateCloudFavorite(id, newFavoriteStatus);

      setHistory((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                isFavorite: newFavoriteStatus,
              }
            : item
        )
      );

      setFavorites((current) => {
        if (newFavoriteStatus) {
          if (current.includes(selectedItem.reply)) {
            return current;
          }

          return [selectedItem.reply, ...current];
        }

        return current.filter(
          (favoriteReply) => favoriteReply !== selectedItem.reply
        );
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Favorite could not be updated.");
    }
  }

  async function deleteHistoryItem(id) {
    try {
      setError("");

      const selectedItem = history.find((item) => item.id === id);

      if (!selectedItem) {
        return;
      }

      await deleteCloudHistory(id);

      setHistory((current) =>
        current.filter((item) => item.id !== id)
      );

      if (selectedItem.isFavorite) {
        setFavorites((current) =>
          current.filter(
            (favoriteReply) => favoriteReply !== selectedItem.reply
          )
        );
      }

      if (reply === selectedItem.reply) {
        setReply("");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "History item could not be deleted.");
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

  function addConversationTurn(role, text = message) {
    const cleanText = text.trim();
    if (!cleanText) return;

    setConversation((current) => [
      ...current,
      { id: `${role}-${Date.now()}`, role, text: cleanText },
    ]);
    setMessage("");
    setError("");
  }

  function updateConversationTurn(id, text) {
    setConversation((current) =>
      current.map((turn) => (turn.id === id ? { ...turn, text } : turn))
    );
  }

  function deleteConversationTurn(id) {
    setConversation((current) => current.filter((turn) => turn.id !== id));
  }

  function switchWorkspaceMode(nextMode) {
    const useConversation = nextMode === "conversation";
    setConversationMode(useConversation);
    setError("");
    setReply("");
    setReplyScore(null);
  }

  function clearAll() {
    setMessage("");
    setReply("");
    setConversation([]);
    setReplyScore(null);
    setError("");
  }

  const filteredHistory = history.filter((item) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    return (
      item.message?.toLowerCase().includes(searchText) ||
      item.reply?.toLowerCase().includes(searchText) ||
      item.tone?.toLowerCase().includes(searchText)
    );
  });

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
            document
              .getElementById("reply-actions")
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          onNewReply={clearAll}
          userName={userName}
        />

        <div className="rf-v4-main-column">
          <header className="rf-v4-topbar">
            <div className="rf-v4-mobile-brand">
              <span>R</span>
              ReplyForge
            </div>

            <div className="rf-v4-topbar-title">
              <strong>{conversationMode ? "Conversation workspace" : "Reply workspace"}</strong>
              <span>{session.user.email}</span>
            </div>

            <div className="rf-v4-topbar-actions">
              <span className="rf-v4-online">
                <i />
                AI online
              </span>

              <button type="button" className="rf-v4-upgrade-button">
                Upgrade
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rf-v4-account-button"
                title="Logout"
              >
                {userName.charAt(0).toUpperCase()}
              </button>
            </div>
          </header>

          <main className="rf-v4-workspace">
            <div className="rf-v4-workspace-primary">
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

                <ButtonGroup
                  createReply={createReply}
                  stopGeneration={stopGeneration}
                  loading={loading}
                  clearAll={clearAll}
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
      {historyOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-sm"
          onClick={() => setHistoryOpen(false)}
        >
          <div
            className="h-full w-full max-w-2xl overflow-y-auto bg-[#f8f9fd] p-5 shadow-2xl dark:bg-[#080d18]"
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
                      <span className="text-violet-600">→</span>
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