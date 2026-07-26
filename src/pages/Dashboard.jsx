import Header from "../components/Header";
import MessageInput from "../components/MessageInput";
import ReplyBox from "../components/ReplyBox";
import HistoryList from "../components/HistoryList";
import Sidebar from "../components/Sidebar";
import Controls from "../components/Controls";
import ButtonGroup from "../components/ButtonGroup";
import FavoriteButton from "../components/FavoriteButton";

function Dashboard({
  message,
  setMessage,
  reply,
  tone,
  setTone,
  length,
  setLength,
  language,
  setLanguage,
  loading,
  createReply,
  clearAll,
  darkMode,
  setDarkMode,
  favorites,
  setFavorites,
  search,
  setSearch,
  history,
  deleteHistoryItem,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          favorites={favorites}
          setFavorites={setFavorites}
          search={search}
          setSearch={setSearch}
        />

        <main className="min-w-0 rounded-3xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 sm:p-8 lg:p-10">
          <Header />

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-7">
            <MessageInput
              message={message}
              setMessage={setMessage}
            />

            <Controls
              tone={tone}
              setTone={setTone}
              length={length}
              setLength={setLength}
              language={language}
              setLanguage={setLanguage}
            />

            <ButtonGroup
              createReply={createReply}
              loading={loading}
              clearAll={clearAll}
            />

            <ReplyBox reply={reply} />

            <div className="mt-4">
              <FavoriteButton
                reply={reply}
                favorites={favorites}
                setFavorites={setFavorites}
              />
            </div>
          </div>

          <HistoryList
            history={history}
            setReply={() => {}}
            setMessage={setMessage}
            deleteHistoryItem={deleteHistoryItem}
          />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;