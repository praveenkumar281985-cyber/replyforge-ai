function Controls({
  tone,
  setTone,
  length,
  setLength,
  language,
  setLanguage,
}) {
  const selectClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-950";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <div>
        <label className={labelClass}>Reply Tone</label>

        <select
          value={tone}
          onChange={(event) => setTone(event.target.value)}
          className={selectClass}
        >
          <option>Professional</option>
          <option>Friendly</option>
          <option>Formal</option>
          <option>Casual</option>
          <option>Funny</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Reply Length</label>

        <select
          value={length}
          onChange={(event) => setLength(event.target.value)}
          className={selectClass}
        >
          <option>Short</option>
          <option>Medium</option>
          <option>Long</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Language</label>

        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className={selectClass}
        >
          <option>English</option>
          <option>Hindi</option>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
        </select>
      </div>
    </div>
  );
}

export default Controls;