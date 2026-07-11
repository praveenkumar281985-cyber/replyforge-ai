function MessageInput({ message, setMessage }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Message
        </label>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          {message.length} characters
        </span>
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Paste the message you received..."
        className="min-h-44 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-950"
      />
    </div>
  );
}

export default MessageInput;