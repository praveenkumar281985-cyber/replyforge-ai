import { useState } from "react";
import supabase from "../lib/supabase";

const configuredAppUrl = import.meta.env.VITE_APP_URL?.replace(/\/$/, "");

function getAuthRedirectUrl() {
  if (configuredAppUrl) return configuredAppUrl;
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return window.location.origin;
  }
  return "https://replyforge-ai-w1n6.vercel.app";
}

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showExistingEmailModal, setShowExistingEmailModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  function clearStatus() {
    setError("");
    setMessage("");
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    clearStatus();
  }

  async function checkEmailExists(cleanEmail) {
    const { data, error: functionError } = await supabase.functions.invoke(
      "check-email-exists",
      { body: { email: cleanEmail } }
    );

    if (functionError) throw functionError;

    return Boolean(
      data?.exists ??
        data?.emailExists ??
        data?.userExists ??
        data?.alreadyExists
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    clearStatus();

    if (mode === "signup" && !cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        const exists = await checkEmailExists(cleanEmail);

        if (exists) {
          setShowExistingEmailModal(true);
          return;
        }

        const { data, error: signupError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanName },
            emailRedirectTo: getAuthRedirectUrl(),
          },
        });

        if (signupError) {
          const text = signupError.message?.toLowerCase() || "";
          if (text.includes("already registered") || text.includes("already exists")) {
            setShowExistingEmailModal(true);
            return;
          }
          throw signupError;
        }

        setMessage(
          data?.session
            ? "Your account has been created successfully."
            : "Account created. Please check your email and confirm your account."
        );
        setPassword("");
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (loginError) {
          if (loginError.message?.toLowerCase().includes("email not confirmed")) {
            throw new Error(
              "Please verify your email before logging in. Check your inbox."
            );
          }
          throw loginError;
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setGoogleLoading(true);
      clearStatus();

      const { data, error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthRedirectUrl(),
          skipBrowserRedirect: true,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (googleError) throw googleError;
      if (!data?.url) throw new Error("Google sign-in could not be started.");
      window.location.assign(data.url);
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || "Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  function openForgotPassword() {
    setForgotEmail(email.trim().toLowerCase());
    setForgotMessage("");
    setForgotError("");
    setShowForgotModal(true);
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    const cleanEmail = forgotEmail.trim().toLowerCase();

    setForgotError("");
    setForgotMessage("");

    if (!cleanEmail) {
      setForgotError("Please enter your email address.");
      return;
    }

    try {
      setForgotLoading(true);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        { redirectTo: `${getAuthRedirectUrl()}?reset-password=true` }
      );

      if (resetError) throw resetError;

      setForgotMessage(
        "Password reset email sent. Please check your inbox and spam folder."
      );
    } catch (err) {
      console.error("Forgot password error:", err);
      setForgotError(err.message || "Password reset email could not be sent.");
    } finally {
      setForgotLoading(false);
    }
  }

  function closeExistingEmailModal() {
    setShowExistingEmailModal(false);
    setMode("login");
    setPassword("");
    clearStatus();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-10">
      <div className="rf-auth-card w-full max-w-md rounded-3xl border border-white/15 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-black text-white shadow-lg">
            R
          </div>
          <h1 className="text-3xl font-black text-slate-900">ReplyForge AI</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create clear, confident and professional replies.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => changeMode("login")}
            aria-pressed={mode === "login"}
            className={`rf-auth-mode-tab rounded-xl px-4 py-3 text-sm font-bold transition ${
              mode === "login"
                ? "rf-auth-mode-tab-active bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => changeMode("signup")}
            aria-pressed={mode === "signup"}
            className={`rf-auth-mode-tab rounded-xl px-4 py-3 text-sm font-bold transition ${
              mode === "signup"
                ? "rf-auth-mode-tab-active bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.38Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.39l-3.24-2.51c-.9.6-2.04.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.59A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.39 13.93A6.01 6.01 0 0 1 6.08 12c0-.67.12-1.32.31-1.93V7.48H3.04A10 10 0 0 0 2 12c0 1.62.39 3.15 1.04 4.52l3.35-2.59Z" />
            <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.48l3.35 2.59C7.18 7.7 9.39 5.94 12 5.94Z" />
          </svg>
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Or continue with email
          </span>
          <div className="h-px flex-1 bg-slate-200" />
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
                autoComplete="name"
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
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-bold text-slate-700">
                Password
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-xs font-bold text-indigo-600 transition hover:text-indigo-800"
                >
                  Forgot password?
                </button>
              )}
            </div>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
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
            disabled={loading || googleLoading}
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
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => changeMode(mode === "login" ? "signup" : "login")}
            className="ml-1 font-bold text-indigo-600 hover:text-indigo-800"
          >
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </p>

        <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
          By continuing, you agree to our{" "}
          <a href="/terms" className="font-bold text-slate-600 hover:text-indigo-700">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="font-bold text-slate-600 hover:text-indigo-700">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {showExistingEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl font-black text-amber-700">
              !
            </div>
            <h2 className="mt-4 text-2xl font-black text-slate-900">
              Already Used Email
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              An account already exists with this email address. Please log in
              or use the forgot-password option.
            </p>
            <button
              type="button"
              onClick={closeExistingEmailModal}
              className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Reset Password
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your registered email. We will send you a secure
                  password-reset link.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !forgotLoading && setShowForgotModal(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-500 hover:bg-slate-200"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {forgotError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {forgotError}
                </div>
              )}

              {forgotMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {forgotMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {forgotLoading ? "Sending reset email..." : "Send Reset Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthPage;
