function HistoryList({ history, setReply, setMessage, deleteHistoryItem }) {
  return (
    <div className="history-section">
      <h2>Reply History</h2>

      {history.length === 0 ? (
        <p>No replies yet.</p>
      ) : (
        history.map((item, index) => (
          <div className="history-card" key={index}>
            <div className="history-meta">
              {item.tone} • {item.length}
            </div>

            <strong>Original Message</strong>
            <p>{item.message}</p>

            <strong>Generated Reply</strong>
            <p>{item.reply}</p>

            <div className="history-actions">
              <button
                onClick={() => {
                  setMessage(item.message);
                  setReply(item.reply);
                }}
              >
                🔄 Use Again
              </button>

              <button onClick={() => deleteHistoryItem(index)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default HistoryList;