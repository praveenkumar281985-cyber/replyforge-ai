import { useEffect, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import MessageInput from "./components/MessageInput";
import ReplyBox from "./components/ReplyBox";
import HistoryList from "./components/HistoryList";

import { generateReply } from "./services/gemini";

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("replyHistory")) || []
  );

  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("replyHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const createReply = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    setLoading(true);

    try {
      const aiReply = await generateReply(message, tone, length, language);
      setReply(aiReply);

      setHistory([
        {
          message,
          reply: aiReply,
          tone,
          length,
          language,
        },
        ...history,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) =>
    item.reply.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <div className="dashboard">
        <aside className="sidebar">
          <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <h2>⭐ Favorites</h2>

          {favorites.map((fav, index) => (
            <div className="history-card" key={index}>
              {fav}
            </div>
          ))}

          <h2>🔍 Search</h2>

          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search replies..."
          />
        </aside>

        <main className="main-panel">
          <Header />

          <MessageInput message={message} setMessage={setMessage} />

          <label>Tone</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Professional</option>
            <option>Friendly</option>
            <option>Formal</option>
            <option>Casual</option>
            <option>Funny</option>
          </select>

          <label>Length</label>
          <select value={length} onChange={(e) => setLength(e.target.value)}>
            <option>Short</option>
            <option>Medium</option>
            <option>Long</option>
          </select>

          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option>English</option>
            <option>Hindi</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>

          <div className="button-group">
            <button onClick={createReply} disabled={loading}>
              {loading ? "Generating..." : "Generate Reply"}
            </button>

            <button onClick={createReply}>🔄 Regenerate</button>
          </div>

          <ReplyBox reply={reply} />

          <button
            onClick={() => {
              if (reply) setFavorites([reply, ...favorites]);
            }}
          >
            ⭐ Add Favorite
          </button>

          <HistoryList
            history={filteredHistory}
            setReply={setReply}
            setMessage={setMessage}
          />
        </main>
      </div>
    </div>
  );
}

export default App;