function AIProviderButton({ provider, preference, onClick }) {
  const isOnline = Boolean(provider?.online);
  const count = provider?.configuredProviders?.length || 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rf-provider-button ${isOnline ? "" : "is-offline"}`}
      title="Open AI Provider Center"
    >
      <span className="rf-provider-button-dot" />

      <span className="rf-provider-button-text">
        <strong>{isOnline ? provider?.label || "AI Provider" : "AI offline"}</strong>
        <small>
          {isOnline
            ? preference?.mode === "manual"
              ? `Preferred · ${count} ready`
              : `Auto · ${count} ready`
            : "Check API keys"}
        </small>
      </span>

      <span className="rf-provider-button-arrow">▾</span>
    </button>
  );
}

export default AIProviderButton;
