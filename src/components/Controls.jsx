function Controls({
  tone,
  setTone,
  length,
  setLength,
  language,
  setLanguage,
}) {
  return (
    <>
      <label>Tone</label>
      <select value={tone} onChange={(e) => setTone(e.target.value)}>
        <option>Professional</option>
        <option>Friendly</option>
        <option>Formal</option>
        <option>Casual</option>
        <option>Funny</option>
      </select>

      <label>Length</label>
      <select value={length} onChange={(e) => setLength(e.target.value)}>
        <option>Short</option>
        <option>Medium</option>
        <option>Long</option>
      </select>

      <label>Language</label>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>English</option>
        <option>Hindi</option>
        <option>Spanish</option>
        <option>French</option>
        <option>German</option>
      </select>
    </>
  );
}

export default Controls;