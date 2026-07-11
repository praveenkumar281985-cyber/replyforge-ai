function Header() {
  return (
    <header className="mb-8 text-center">
      <div className="mb-4 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
        ✨ AI Communication Assistant
      </div>

      <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
        ReplyForge AI
      </h1>

      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
        Generate smart, natural and professional replies for chats, emails and
        social media in seconds.
      </p>
    </header>
  );
}

export default Header;