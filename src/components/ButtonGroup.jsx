function ButtonGroup({ createReply, loading }) {
  return (
    <div className="button-group">
      <button onClick={createReply} disabled={loading}>
        {loading ? "Generating..." : "Generate Reply"}
      </button>

      <button onClick={createReply} disabled={loading}>
        🔄 Regenerate
      </button>
    </div>
  );
}

export default ButtonGroup;