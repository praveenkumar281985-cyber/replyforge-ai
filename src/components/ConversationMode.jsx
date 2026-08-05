import { useEffect, useRef, useState } from "react";

function ConversationMode({
  conversation,
  draft,
  setDraft,
  addTurn,
  updateTurn,
  deleteTurn,
  loading,
}) {
  const timelineRef = useRef(null);
  const [draftRole, setDraftRole] = useState("customer");

  useEffect(() => {
    timelineRef.current?.scrollTo({
      top: timelineRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversation.length]);

  function submitTurn() {
    if (!draft.trim()) return;
    addTurn(draftRole, draft);
  }

  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      submitTurn();
    }
  }

  return (
    <section className="rf-v4-conversation-card">
      <header className="rf-v4-conversation-header">
        <div>
          <span className="rf-v4-conversation-kicker">Context memory on</span>
          <h2>Build the conversation</h2>
          <p>ReplyForge will read every turn before writing the next response.</p>
        </div>

        <span className="rf-v4-turn-count">
          {conversation.length} {conversation.length === 1 ? "turn" : "turns"}
        </span>
      </header>

      <div ref={timelineRef} className="rf-v4-conversation-timeline">
        {conversation.length === 0 ? (
          <div className="rf-v4-conversation-empty">
            <div>◌</div>
            <strong>No conversation added yet</strong>
            <p>Add the customer’s latest message below, or include earlier context first.</p>
          </div>
        ) : (
          conversation.map((turn, index) => (
            <article
              key={turn.id}
              className={`rf-v4-turn ${
                turn.role === "customer" ? "is-customer" : "is-assistant"
              }`}
            >
              <div className="rf-v4-turn-avatar">
                {turn.role === "customer" ? "C" : "Y"}
              </div>

              <div className="rf-v4-turn-content">
                <div className="rf-v4-turn-meta">
                  <strong>{turn.role === "customer" ? "Customer" : "You"}</strong>
                  <span>Turn {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => deleteTurn(turn.id)}
                    aria-label={`Delete turn ${index + 1}`}
                  >
                    Delete
                  </button>
                </div>

                <textarea
                  value={turn.text}
                  onChange={(event) => updateTurn(turn.id, event.target.value)}
                  aria-label={`${turn.role === "customer" ? "Customer" : "Your"} message`}
                />
              </div>
            </article>
          ))
        )}
      </div>

      <div className="rf-v4-conversation-composer">
        <div className="rf-v4-role-picker" aria-label="Message author">
          <button
            type="button"
            onClick={() => setDraftRole("customer")}
            className={draftRole === "customer" ? "is-active" : ""}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setDraftRole("assistant")}
            className={draftRole === "assistant" ? "is-active" : ""}
          >
            You
          </button>
        </div>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, 5000))}
          onKeyDown={handleKeyDown}
          placeholder={
            draftRole === "customer"
              ? "Paste the customer’s next message…"
              : "Add one of your previous replies for context…"
          }
          aria-label="Conversation message"
        />

        <div className="rf-v4-conversation-composer-footer">
          <span>{draft.length.toLocaleString()}/5,000</span>
          <span>Ctrl/⌘ + Enter to add</span>
          <button
            type="button"
            onClick={submitTurn}
            disabled={!draft.trim() || loading}
          >
            Add to conversation
            <span>＋</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default ConversationMode;
