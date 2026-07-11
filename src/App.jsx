import { useState } from "react";

import Header from "./components/Header";
import MessageInput from "./components/MessageInput";
import ReplyBox from "./components/ReplyBox";
import HistoryList from "./components/HistoryList";
import Sidebar from "./components/Sidebar";
import Controls from "./components/Controls";
import ButtonGroup from "./components/ButtonGroup";
import FavoriteButton from "./components/FavoriteButton";

import useLocalStorage from "./hooks/useLocalStorage";
import { generateReply } from "./services/gemini";

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useLocalStorage(
    "darkMode",
    false
  );

  const [history, setHistory] = useLocalStorage(
    "replyHistory",
    []
  );

  const [favorites, setFavorites] = useLocalStorage(
    "favorites",
    []
  );

  const filteredHistory = history.filter((item) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    return (
      (item.message || "").toLowerCase().includes(searchText) ||
      (item.reply || "").toLowerCase().includes(searchText) ||
      (item.tone || "").toLowerCase().includes(searchText) ||
      (item.language || "").toLowerCase().includes(searchText)
    );
  });

  const createReply = async () => {
    if (!message.trim()) {
      setError("Please enter a message before generating a reply.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const aiReply = await generateReply(
        message,
        tone,
        length,
        language
      );

      setReply(aiReply);

      setHistory((previousHistory) => [
        {
          id: crypto.randomUUID(),
          message,
          reply: aiReply,
          tone,
          length,
          language,
          createdAt: new Date().toISOString(),
        },
        ...previousHistory,
      ]);
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.message ||
          "Something went wrong while generating the reply."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setMessage("");
    setReply("");
    setError("");
  };

  const deleteHistoryItem = (indexToDelete) => {
    setHistory((previousHistory) =>
      previousHistory.filter(
        (_, index) => index !== indexToDelete
      )
    );
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-5 transition-colors sm:px-6 sm:py-8">
        <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Sidebar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            favorites={favorites}
            setFavorites={setFavorites}
            search={search}
            setSearch={setSearch}
          />

          <main className="min-w-0 rounded-3xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 sm:p-8 lg:p-10">
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

              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                  {error}
                </div>
              )}

              <ButtonGroup
                createReply={createReply}
                loading={loading}
                clearAll={clearAll}
              />

              <ReplyBox reply={reply} />

              <div className="mt-4">
                <FavoriteButton
                  reply={reply}
                  favorites={favorites}
                  setFavorites={setFavorites}
                />
              </div>
            </div>

            <HistoryList
              history={filteredHistory}
              setReply={setReply}
              setMessage={setMessage}
              deleteHistoryItem={deleteHistoryItem}
            />
          </main>
        </div>

        <footer className="mx-auto mt-6 max-w-7xl text-center text-xs text-slate-400">
          ReplyForge AI • Smart replies powered by artificial intelligence
        </footer>
      </div>
    </div>
  );
}

export default App;