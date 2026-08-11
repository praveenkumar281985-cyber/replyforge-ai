import { useEffect, useRef, useState } from "react";

function Control({ label, value, onChange, options, icon }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`rf-v4-control ${open ? "is-open" : ""}`}
    >
      <button
        type="button"
        className="rf-v4-control-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="rf-v4-control-icon">{icon}</span>

        <span className="rf-v4-control-copy">
          <span>{label}</span>
          <strong>{value}</strong>
        </span>

        <span className="rf-v4-control-chevron">⌄</span>
      </button>

      {open && (
        <div className="rf-v4-control-menu" role="listbox" aria-label={label}>
          <div className="rf-v4-control-menu-head">
            <span>{label}</span>
            <small>Choose one</small>
          </div>

          <div className="rf-v4-control-options">
            {options.map((option) => {
              const selected = option === value;

              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={selected ? "is-selected" : ""}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <span>{option}</span>
                  {selected && <span className="rf-v4-control-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Controls({
  tone,
  setTone,
  length,
  setLength,
  language,
  setLanguage,
  persona,
  setPersona,
}) {
  return (
    <div className="rf-v4-controls">
      <Control
        label="Tone"
        value={tone}
        onChange={setTone}
        icon="◐"
        options={["Professional", "Friendly", "Formal", "Casual", "Funny"]}
      />

      <Control
        label="Length"
        value={length}
        onChange={setLength}
        icon="↔"
        options={["Short", "Medium", "Long"]}
      />

      <Control
        label="Language"
        value={language}
        onChange={setLanguage}
        icon="◎"
        options={["English", "Hindi", "Spanish", "French", "German"]}
      />

      <Control
        label="Persona"
        value={persona}
        onChange={setPersona}
        icon="◇"
        options={[
          "Professional",
          "Friendly",
          "CEO",
          "HR Manager",
          "Lawyer",
          "Sales Expert",
          "Customer Support",
          "Psychologist",
          "Negotiation Expert",
          "Strict Boss",
          "Dating Coach",
        ]}
      />
    </div>
  );
}

export default Controls;
