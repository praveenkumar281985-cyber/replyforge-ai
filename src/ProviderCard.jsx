function ProviderCard({ provider, active, preferred, onSelect }) {
  return (
    <button
      type="button"
      className={`rf-provider-card ${active ? "is-active" : ""} ${
        preferred ? "is-preferred" : ""
      }`}
      onClick={onSelect}
    >
      <span className="rf-provider-card-status" />

      <span className="rf-provider-card-copy">
        <strong>{provider.label}</strong>
        <small>{provider.model}</small>
      </span>

      <span className="rf-provider-card-badge">
        {active ? "Active" : preferred ? "Preferred" : "Ready"}
      </span>
    </button>
  );
}

export default ProviderCard;
