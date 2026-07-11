function Sidebar({
  darkMode,
  setDarkMode,
  favorites,
  setFavorites,
  search,
  setSearch,
}) {
  const deleteFavorite = (indexToDelete) => {
    setFavorites(favorites.filter((_, index) => index !== indexToDelete));
  };

  return (
    <aside className="sidebar">
      <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <h2>⭐ Favorites</h2>

      <button onClick={() => setFavorites([])}>Clear Favorites</button>

      {favorites.length === 0 ? (
        <p>No favorites yet.</p>
      ) : (
        favorites.map((fav, index) => (
          <div className="history-card" key={index}>
            <p>{fav}</p>
            <button onClick={() => deleteFavorite(index)}>🗑 Delete</button>
          </div>
        ))
      )}

      <h2>🔍 Search</h2>

      <input
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search replies..."
      />
    </aside>
  );
}

export default Sidebar;