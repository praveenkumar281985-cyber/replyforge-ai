function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
      <h1 className="text-6xl font-extrabold">404</h1>

      <p className="mt-4 text-slate-300">
        Page not found.
      </p>

      <a
        href="/"
        className="mt-6 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white"
      >
        Go to Dashboard
      </a>
    </div>
  );
}

export default NotFound;
