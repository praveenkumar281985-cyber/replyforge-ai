function Control({ label, value, onChange, options, icon }) {
  return (
    <label className="rf-v4-control">
      <span className="rf-v4-control-icon">{icon}</span>

      <span className="rf-v4-control-copy">
        <span>{label}</span>
        <strong>{value}</strong>
      </span>

      <span className="rf-v4-control-chevron">⌄</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
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
