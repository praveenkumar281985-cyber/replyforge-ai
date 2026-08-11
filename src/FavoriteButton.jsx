import { useState } from "react";

function FavoriteButton({
  reply,
  favorites,
  setFavorites,
}) {
  const [message, setMessage] = useState("");

  const addFavorite = () => {
    if (!reply) {
      setMessage("Generate a reply first.");
      return;
    }

    if (favorites.includes(reply)) {
      setMessage("This reply is already in favorites.");
      return;
    }

    setFavorites((previousFavorites) => [
      reply,
      ...previousFavorites,
    ]);

    setMessage("Added to favorites.");

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  return (
    <div>
      <button
        type="button"
        onClick={addFavorite}
        disabled={!reply}
        className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 font-semibold text-amber-700 transition hover:-translate-y-0.5 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70"
      >
        ⭐ Add to Favorites
      </button>

      {message && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {message}
        </div>
      )}
    </div>
  );
}

export default FavoriteButton;