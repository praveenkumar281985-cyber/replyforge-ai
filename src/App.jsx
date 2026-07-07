import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import MessageInput from "./components/MessageInput";
import ReplyBox from "./components/ReplyBox";
import { generateReply } from "./services/gemini";

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const handleGenerateReply = async () => {
    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }

    try {
      const aiReply = await generateReply(message);
      setReply(aiReply);
    } catch (error) {
      console.error(error);
      setReply("Something went wrong while generating the reply.");
    }
  };

  return (
    <div className="app">
      <div className="card">
        <Header />

        <MessageInput
          message={message}
          setMessage={setMessage}
        />

        <button onClick={handleGenerateReply}>
          Generate Reply
        </button>

        <ReplyBox reply={reply} />
      </div>
    </div>
  );
}

export default App;