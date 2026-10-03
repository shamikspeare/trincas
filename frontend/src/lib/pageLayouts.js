import { supabase } from "./supabase";

export const getFoodPageKey = (slug) => `food:${slug}`;
export const getHistoryPageKey = (year) => `history:${year}`;
export const MUSIC_PAGE_KEY = "music";
export const MUSIC_SCHEDULE_PAGE_KEY = "music-schedule";
export const MUSIC_TAVERN_SCHEDULE_PAGE_KEY = "music-tavern-schedule";
export const BOOK_PAGE_KEY = "book";

export function normalizeInstagramUrl(value) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();
    const isInstagram = hostname === "instagram.com" || hostname.endsWith(".instagram.com");
    if (url.protocol !== "https:" || !isInstagram) return null;

    const pathParts = url.pathname.split("/").filter(Boolean);
    let contentType = pathParts[0];
    let shortcode = pathParts[1];

    // Instagram now also shares URLs such as /share/reel/<shortcode>/.
    // Persist one canonical post/reel URL so the same URL works in the public
    // embed and remains stable when query tracking parameters change.
    if (contentType === "share") {
      contentType = pathParts[1];
      shortcode = pathParts[2];
    }

    if (contentType === "reels") contentType = "reel";
    if (!shortcode || !["p", "reel", "tv"].includes(contentType)) return null;

    return `https://www.instagram.com/${contentType}/${shortcode}/`;
  } catch {
    return null;
  }
}

export function getInstagramEmbedUrl(value) {
  const canonicalUrl = normalizeInstagramUrl(value);
  return canonicalUrl ? `${canonicalUrl}embed/` : null;
}

export async function fetchPageLayout(pageKey) {
  const [layoutResult, imageCardsResult, instagramResult] = await Promise.all([
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
  ]);

  const failed = [layoutResult, imageCardsResult, instagramResult].find((result) => result.error);
  if (failed?.error) throw failed.error;

  return {
    layout: layoutResult.data,
    imageCards: imageCardsResult.data ?? [],
    instagramVideos: instagramResult.data ?? [],
  };
}
