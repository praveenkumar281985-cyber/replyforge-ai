import {
  getCloudHistory,
  updateCloudFavorite,
  deleteCloudHistory,
} from "./history";

export function convertCloudItem(item) {
  return {
    id: item.id,
    message: item.original_message,
    reply: item.generated_reply,
    tone:
      item.tone ||
      "Professional",
    length: "Medium",
    language: "English",
    isFavorite:
      Boolean(item.is_favorite),
    createdAt: item.created_at,
    cloudSaved: true,
  };
}

export async function loadHistoryBundle() {
  const cloudHistory =
    await getCloudHistory();

  const history =
    cloudHistory.map(
      convertCloudItem
    );

  const favorites = history
    .filter(
      (item) =>
        item.isFavorite
    )
    .map(
      (item) =>
        item.reply
    );

  return {
    history,
    favorites,
  };
}

export async function toggleHistoryFavorite({
  history,
  id,
}) {
  const selectedItem =
    history.find(
      (item) =>
        item.id === id
    );

  if (!selectedItem) {
    return null;
  }

  const isFavorite =
    !selectedItem.isFavorite;

  await updateCloudFavorite(
    id,
    isFavorite
  );

  const nextHistory =
    history.map(
      (item) =>
        item.id === id
          ? {
              ...item,
              isFavorite,
            }
          : item
    );

  const favorites =
    nextHistory
      .filter(
        (item) =>
          item.isFavorite
      )
      .map(
        (item) =>
          item.reply
      );

  return {
    selectedItem,
    isFavorite,
    history: nextHistory,
    favorites,
  };
}

export async function removeHistoryItem({
  history,
  id,
  currentReply,
}) {
  const selectedItem =
    history.find(
      (item) =>
        item.id === id
    );

  if (!selectedItem) {
    return null;
  }

  await deleteCloudHistory(id);

  const nextHistory =
    history.filter(
      (item) =>
        item.id !== id
    );

  const favorites =
    nextHistory
      .filter(
        (item) =>
          item.isFavorite
      )
      .map(
        (item) =>
          item.reply
      );

  return {
    selectedItem,
    history: nextHistory,
    favorites,
    shouldClearReply:
      currentReply ===
      selectedItem.reply,
  };
}

export function filterHistoryItems({
  history,
  search,
}) {
  const searchText =
    String(search || "")
      .trim()
      .toLowerCase();

  if (!searchText) {
    return history;
  }

  return history.filter(
    (item) =>
      item.message
        ?.toLowerCase()
        .includes(searchText) ||
      item.reply
        ?.toLowerCase()
        .includes(searchText) ||
      item.tone
        ?.toLowerCase()
        .includes(searchText)
  );
}
