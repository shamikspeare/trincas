import { supabase } from "./supabase";

const TABLE = "book_page_sections";

export async function fetchBookSections() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, section_type, display_order, heading, body, image_url, alt_text, created_at, updated_at")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createBookSection(section) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(section)
    .select("id, section_type, display_order, heading, body, image_url, alt_text, created_at, updated_at")
    .single();

  if (error) throw error;
  return data;
}

export async function updateBookSection(id, fields) {
  const { error } = await supabase
    .from(TABLE)
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteBookSection(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function reorderBookSections(orderedIds) {
  for (const [displayOrder, id] of orderedIds.entries()) {
    await updateBookSection(id, { display_order: displayOrder });
  }
}
