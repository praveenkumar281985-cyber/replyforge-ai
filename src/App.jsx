import { useEffect, useState } from "react";

import Header from "./components/Header";
import MessageInput from "./components/MessageInput";
import Controls from "./components/Controls";
import ButtonGroup from "./components/ButtonGroup";
import ReplyBox from "./components/ReplyBox";
import ReplyScore from "./components/ReplyScore";
import Sidebar from "./components/Sidebar";
import HistoryList from "./components/HistoryList";
import FavoriteButton from "./components/FavoriteButton";
import AuthPage from "./components/AuthPage";

import { generateReply } from "./services/gemini";
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

  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [language, setLanguage] = useState("English");

  const [loading, setLoading] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);
const [replyScore, setReplyScore] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  async function createReply() {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      setError("Please enter a message before generating a reply.");
      return;
    }

    if (!session?.user?.id) {
      setError("Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const generatedReply = await generateReply(
        cleanMessage,
        tone,
        length,
        language
      );

      if (!generatedReply?.trim()) {
        throw new Error("No reply was generated.");
      }

      const cleanReply = generatedReply.trim();

      setReply(cleanReply);

      const savedItem = await saveReplyToCloud({
        userId: session.user.id,
        originalMessage: cleanMessage,
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
      console.error(err);
      setError(err.message || "Unable to generate reply.");
    } finally {
      setLoading(false);
    }
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

    const prompt = `Analyze the following reply.

Return only valid JSON.
Do not use markdown code blocks.
Do not add any explanation.

{
  "overall": 0,
  "grammar": 0,
  "clarity": 0,
  "professionalism": 0,
  "politeness": 0,
  "confidence": 0,
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ]
}

Give every score from 0 to 100.

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
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to logout.");
    }
  }

  function clearAll() {
    setMessage("");
    setReply("");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
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
        />

        <main className="min-w-0 rounded-3xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 sm:p-8 lg:p-10">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Welcome back
              </p>

              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {userName}
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {session.user.email}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                Free Plan
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </div>

          <Header />

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-7">
            <MessageInput
              message={message}
              setMessage={setMessage}
            />

            <Controls
              tone={tone}
              setTone={setTone}
              length={length}
              setLength={setLength}
              language={language}
              setLanguage={setLanguage}
            />

            <ButtonGroup
              createReply={createReply}
              loading={loading}
              clearAll={clearAll}
            />

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            <ReplyBox
  reply={reply}
  setReply={setReply}
  rewriteReply={rewriteCurrentReply}
  rewriteLoading={rewriteLoading}
  translateReply={translateCurrentReply}
translateLoading={translateLoading}
  regenerateReply={createReply}
  generateLoading={loading}
/>
<ReplyScore
  replyScore={replyScore}
  scoreLoading={scoreLoading}
  analyzeReply={analyzeReply}
/>


            <div className="mt-4">
              <FavoriteButton
                reply={reply}
                favorites={favorites}
                setFavorites={setFavorites}
              />
            </div>
          </div>

          {historyLoading ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />

              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                Loading cloud history...
              </p>
            </div>
          ) : (
            <HistoryList
              history={filteredHistory}
              setReply={setReply}
              setMessage={setMessage}
              deleteHistoryItem={deleteHistoryItem}
              toggleFavorite={toggleFavorite}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;