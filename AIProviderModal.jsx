import ProviderCard from "./ProviderCard";
import ProviderRadio from "./ProviderRadio";

function AIProviderModal({
  open,
  providerStatus,
  preference,
  onPreferenceChange,
  onClose,
}) {
  if (!open) return null;

  const providers = providerStatus?.configuredProviders || [];

  function chooseAuto() {
    onPreferenceChange({
      mode: "auto",
      providerId: preference?.providerId || providers[0]?.id || "openrouter",
    });
  }

  function chooseProvider(providerId) {
    onPreferenceChange({ mode: "manual", providerId });
  }

  return (
    <div className="rf-provider-overlay" onClick={onClose}>
      <section className="rf-provider-modal" onClick={(event) => event.stopPropagation()}>
        <header className="rf-provider-modal-header">
          <div>
            <span className="rf-provider-modal-kicker">AI routing</span>
            <h2>AI Provider Center</h2>
            <p>Choose automatic fallback or prefer a specific provider.</p>
          </div>

          <button type="button" className="rf-provider-close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="rf-provider-modal-body">
          <section>
            <div className="rf-provider-section-title">
              <div>
                <strong>Routing mode</strong>
                <small>Your preference is saved in this browser.</small>
              </div>
            </div>

            <div className="rf-provider-radio-grid">
              <ProviderRadio
                checked={preference?.mode === "auto"}
                label="Auto fallback"
                description="Try providers in order and use the next one if needed."
                onChange={chooseAuto}
              />

              <ProviderRadio
                checked={preference?.mode === "manual"}
                label="Preferred provider"
                description="Try your selected provider first, then keep fallback enabled."
                onChange={() => {
                  const id = preference?.providerId || providers[0]?.id;
                  if (id) chooseProvider(id);
                }}
              />
            </div>
          </section>

          <section>
            <div className="rf-provider-section-title">
              <div>
                <strong>Available providers</strong>
                <small>{providers.length} configured in this project</small>
              </div>
              <span className="rf-provider-live-pill">Fallback enabled</span>
            </div>

            <div className="rf-provider-card-list">
              {providers.length ? (
                providers.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    active={provider.id === providerStatus?.id}
                    preferred={
                      preference?.mode === "manual" &&
                      provider.id === preference?.providerId
                    }
                    onSelect={() => chooseProvider(provider.id)}
                  />
                ))
              ) : (
                <div className="rf-provider-empty">
                  No AI provider key is configured. Check your .env file.
                </div>
              )}
            </div>
          </section>

          <footer className="rf-provider-summary">
            <div>
              <span>Current provider</span>
              <strong>{providerStatus?.online ? providerStatus.label : "Offline"}</strong>
            </div>
            <div>
              <span>Current model</span>
              <strong>{providerStatus?.model || "Not available"}</strong>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}

export default AIProviderModal;
