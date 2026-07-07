import "./App.css";

function App() {
  return (
    <div className="app">
      <div className="card">
        <h1>ReplyForge AI 🚀</h1>

        <p>
          Generate the perfect AI reply for any message in seconds.
        </p>

        <textarea
          placeholder="Paste the message here..."
        ></textarea>

        <button>Generate Reply</button>
      </div>
    </div>
  );
}

export default App;