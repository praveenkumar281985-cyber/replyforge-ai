function ButtonGroup({
  createReply,
  stopGeneration,
  loading,
  clearAll,
  providerName,
}) {
  return (
    <div className="rf-v4-generate-row">
      <div className="rf-v4-generation-note">
        <span className="rf-v4-spark">✦</span>

        {loading
          ? "Reply is appearing live. You can stop generation at any time."
          : `${providerName || "AI"} creates one polished reply using your selected context.`}
      </div>

      <div className="rf-v4-generate-actions">
        <button
          type="button"
          onClick={clearAll}
          disabled={loading}
          className="rf-v4-clear-button"
        >
          Clear workspace
        </button>

        {loading ? (
          <button
            type="button"
            onClick={stopGeneration}
            className="rf-v4-stop-button"
          >
            <span className="rf-v4-stop-icon" />
            Stop generation
          </button>
        ) : (
          <button
            type="button"
            onClick={createReply}
            className="rf-v4-generate-button"
          >
            <span>✦</span>
            Generate reply
            <span className="rf-v4-button-arrow">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ButtonGroup;
