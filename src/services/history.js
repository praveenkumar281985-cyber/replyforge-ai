import supabase from "../lib/supabase";

export async function saveReplyToCloud({
  userId,
  originalMessage,
  generatedReply,
  tone,
}) {
  const { data, error } = await supabase
    .from("reply_history")
    .insert({
      user_id: userId,
      original_message: originalMessage,
      generated_reply: generatedReply,
      tone,
      is_favorite: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCloudHistory() {
  const { data, error } = await supabase
    .from("reply_history")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function updateCloudFavorite(id, isFavorite) {
  const { data, error } = await supabase
    .from("reply_history")
    .update({
      is_favorite: isFavorite,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCloudHistory(id) {
  const { error } = await supabase
    .from("reply_history")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}