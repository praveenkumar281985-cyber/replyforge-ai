import { useState } from "react";
import "./App.css";

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

  const createReply = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    setLoading(true);

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
    } catch (error) {
      console.error(error);
      setReply("Something went wrong while generating the reply.");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      (item.reply || "").toLowerCase().includes(searchText) ||
      (item.message || "").toLowerCase().includes(searchText)
    );
  });

  const clearAll = () => {
    setMessage("");
    setReply("");
  };

  const deleteHistoryItem = (indexToDelete) => {
    setHistory((previousHistory) =>
      previousHistory.filter(
        (_, index) => index !== indexToDelete
      )
    );
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <div className="dashboard">
        <Sidebar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          favorites={favorites}
          setFavorites={setFavorites}
          search={search}
          setSearch={setSearch}
        />

        <main className="main-panel">
          <Header />

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

          <ReplyBox reply={reply} />

          <FavoriteButton
            reply={reply}
            favorites={favorites}
            setFavorites={setFavorites}
          />

          <HistoryList
            history={filteredHistory}
            setReply={setReply}
            setMessage={setMessage}
            deleteHistoryItem={deleteHistoryItem}
          />
        </main>
      </div>
    </div>
  );
}

export default App;