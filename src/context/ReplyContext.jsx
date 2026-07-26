import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { generateReply } from "../services/gemini";

const ReplyContext = createContext(null);

function getSavedData(key, defaultValue) {
  try {
    const savedData = localStorage.getItem(key);

    if (!savedData) {
      return defaultValue;
    }

    return JSON.parse(savedData);
  } catch (error) {
    console.error(`Unable to read ${key} from localStorage:`, error);
    return defaultValue;
  }
}

export function ReplyProvider({ children }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [language, setLanguage] = useState("English");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [history, setHistory] = useState(() =>
    getSavedData("replyforge-history", [])
  );

  const [favorites, setFavorites] = useState(() =>
    getSavedData("replyforge-favorites", [])
  );

  const [darkMode, setDarkMode] = useState(() =>
    getSavedData("replyforge-dark-mode", true)
  );

  useEffect(() => {
    localStorage.setItem(
      "replyforge-history",
      JSON.stringify(history)
    );
  }, [history]);

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

    try {
      setLoading(true);
      setError("");

      const generatedReply = await generateReply(
        cleanMessage,
        tone,
        length,
        language
      );

      if (
        !generatedReply ||
        typeof generatedReply !== "string" ||
        !generatedReply.trim()
      ) {
        throw new Error("No reply was generated.");
      }

      const cleanReply = generatedReply.trim();

      setReply(cleanReply);

      const historyItem = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
        message: cleanMessage,
        reply: cleanReply,
        tone,
        length,
        language,
        createdAt: new Date().toISOString(),
      };

      setHistory((currentHistory) => [
        historyItem,
        ...currentHistory,
      ]);
    } catch (requestError) {
      console.error("Reply generation failed:", requestError);

      setError(
        requestError?.message ||
          "Unable to generate a reply. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setMessage("");
    setReply("");
    setError("");
  }

  function deleteHistoryItem(itemId) {
    setHistory((currentHistory) =>
      currentHistory.filter((item) => item.id !== itemId)
    );
  }

  function selectHistoryItem(item) {
    if (!item) {
      return;
    }

    setMessage(item.message || "");
    setReply(item.reply || "");

    if (item.tone) {
      setTone(item.tone);
    }

    if (item.length) {
      setLength(item.length);
    }

    if (item.language) {
      setLanguage(item.language);
    }

    setError("");
  }

  function clearHistory() {
    setHistory([]);
  }

  function clearFavorites() {
    setFavorites([]);
  }

  const filteredHistory = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    if (!cleanSearch) {
      return history;
    }

    return history.filter((item) => {
      const messageText = item.message?.toLowerCase() || "";
      const replyText = item.reply?.toLowerCase() || "";

      return (
        messageText.includes(cleanSearch) ||
        replyText.includes(cleanSearch)
      );
    });
  }, [history, search]);

  const contextValue = {
    message,
    setMessage,

    reply,
    setReply,

    tone,
    setTone,

    length,
    setLength,

    language,
    setLanguage,

    loading,
    error,
    setError,

    createReply,
    clearAll,

    history,
    filteredHistory,
    setHistory,
    deleteHistoryItem,
    selectHistoryItem,
    clearHistory,

    favorites,
    setFavorites,
    clearFavorites,

    darkMode,
    setDarkMode,

    search,
    setSearch,
  };

  return (
    <ReplyContext.Provider value={contextValue}>
      {children}
    </ReplyContext.Provider>
  );
}

export function useReply() {
  const context = useContext(ReplyContext);

  if (!context) {
    throw new Error(
      "useReply must be used inside the ReplyProvider."
    );
  }

  return context;
}

export default ReplyContext;