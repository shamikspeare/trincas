import { supabase } from "./supabase";

export const getFoodPageKey = (slug) => `food:${slug}`;
export const getHistoryPageKey = (year) => `history:${year}`;
export const MUSIC_PAGE_KEY = "music";
export const MUSIC_SCHEDULE_PAGE_KEY = "music-schedule";
export const MUSIC_TAVERN_SCHEDULE_PAGE_KEY = "music-tavern-schedule";
export const getFoodSlugFromPageKey = (pageKey) => {
  if (!pageKey?.startsWith("food:")) return null;
  const slug = pageKey.slice("food:".length).trim();
  return slug || null;
};

export function normalizeInstagramUrl(value) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();
    const isInstagram = hostname === "instagram.com" || hostname.endsWith(".instagram.com");
    if (url.protocol !== "https:" || !isInstagram) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function getInstagramShortcode(url) {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

export async function fetchPageLayout(pageKey) {
  const foodSlug = getFoodSlugFromPageKey(pageKey);
  const [layoutResult, imageCardsResult, instagramResult, foodMenuResult] = await Promise.all([
    supabase.from("page_layouts").select("page_key, heading, lead_image_url, body").eq("page_key", pageKey).maybeSingle(),
    supabase
      .from("page_image_cards")
      .select("id, image_url, alt_text, display_order")
      .eq("page_key", pageKey)
      .order("display_order", { ascending: true }),
    supabase
      .from("page_instagram_videos")
      .select("id, instagram_url, display_order")
      .eq("page_key", pageKey)
      .order("display_order", { ascending: true }),
    foodSlug
      ? supabase
          .from("food_pages")
          .select("menu_images")
          .eq("slug", foodSlug)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const failed = [layoutResult, imageCardsResult, instagramResult, foodMenuResult].find((result) => result.error);
  if (failed?.error) throw failed.error;

  const menuImages = Array.isArray(foodMenuResult.data?.menu_images)
    ? foodMenuResult.data.menu_images.filter(Boolean)
    : [];

  return {
    layout: layoutResult.data,
    imageCards: imageCardsResult.data ?? [],
    instagramVideos: instagramResult.data ?? [],
    menuImages,
  };
}
