function ProviderRadio({ checked, label, description, onChange }) {
  return (
    <button
      type="button"
      className={`rf-provider-radio ${checked ? "is-selected" : ""}`}
      onClick={onChange}
      aria-pressed={checked}
    >
      <span className="rf-provider-radio-dot" />
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </button>
  );
}

export default ProviderRadio;
