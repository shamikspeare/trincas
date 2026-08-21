import { supabase } from "../../lib/supabase";

export async function fetchPageSections(pageSlug) {
  const { data, error } = await supabase
    .from("dining_page_sections")
    .select("*")
    .eq("page_slug", pageSlug)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addSection(pageSlug, sectionType, existingCount) {
  const payload = {
    page_slug: pageSlug,
    section_type: sectionType,
    display_order: existingCount,
    ...(sectionType === "text" ? { heading: "", body: "" } : { image_url: null, alt_text: "" }),
  };

  const { data, error } = await supabase
    .from("dining_page_sections")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSection(id, fields) {
  const { error } = await supabase
    .from("dining_page_sections")
    .update(fields)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteSection(id) {
  const { error } = await supabase
    .from("dining_page_sections")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function reorderSections(pageSlug, orderedIds) {
  const { error } = await supabase.rpc("reorder_dining_sections", {
    p_page_slug: pageSlug,
    p_ordered_ids: orderedIds,
  });

  if (error) throw error;
}