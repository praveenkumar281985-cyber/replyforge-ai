import { useState } from "react";
import supabase from "../lib/supabase";

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (mode === "signup") {
        const { error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
            emailRedirectTo: window.location.origin,
          },
        });

        if (signupError) throw signupError;

        setMessage(
          "Account created. Please check your email and confirm your account."
        );
      } else {
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (loginError) throw loginError;
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setError("");
    setMessage("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-black text-white shadow-lg">
            R
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            ReplyForge AI
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create clear, confident and professional replies.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
              mode === "login"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setMessage("");
            }}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
              mode === "signup"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 font-bold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login to ReplyForge"
                : "Create Free Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={switchMode}
            className="ml-1 font-bold text-indigo-600 hover:text-indigo-800"
          >
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;