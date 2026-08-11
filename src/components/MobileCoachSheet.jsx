import { useEffect } from "react";
import ReplyScore from "./ReplyScore";

function MobileCoachSheet({ open, onClose, ...coachProps }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="rf-mobile-coach-backdrop"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="rf-mobile-coach-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="AI Reply Coach"
      >
        <div className="rf-mobile-coach-handle" aria-hidden="true" />
        <header className="rf-mobile-coach-header">
          <div>
            <span>Premium workspace</span>
            <strong>AI Reply Coach</strong>
          </div>
          <button type="button" onClick={onClose} aria-label="Close AI Coach">
            ×
          </button>
        </header>

        <div className="rf-mobile-coach-content">
          <ReplyScore {...coachProps} />
        </div>
      </section>
    </div>
  );
}

export default MobileCoachSheet;
