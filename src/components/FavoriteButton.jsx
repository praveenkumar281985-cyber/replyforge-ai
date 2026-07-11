function FavoriteButton({ reply, favorites, setFavorites }) {
  const addFavorite = () => {
    if (!reply) return;

    setFavorites([
      reply,
      ...favorites,
    ]);
  };

  return (
    <button onClick={addFavorite}>
      ⭐ Add Favorite
    </button>
  );
}

export default FavoriteButton;