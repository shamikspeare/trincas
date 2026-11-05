-- Food image cards and Instagram reels share one display_order sequence.
-- Preserve the previous public layout by keeping all images before all reels,
-- while normalizing gaps and collisions left by the former separate lists.
with ranked_images as (
  select
    id,
    row_number() over (
      partition by page_key
      order by display_order, created_at, id
    ) - 1 as new_display_order
  from public.page_image_cards
  where page_key like 'food:%'
)
update public.page_image_cards as card
set display_order = ranked.new_display_order
from ranked_images as ranked
where card.id = ranked.id
  and card.display_order is distinct from ranked.new_display_order;

with image_counts as (
  select page_key, count(*)::integer as image_count
  from public.page_image_cards
  where page_key like 'food:%'
  group by page_key
),
ranked_videos as (
  select
    video.id,
    coalesce(image_counts.image_count, 0)
      + row_number() over (
          partition by video.page_key
          order by video.display_order, video.created_at, video.id
        )::integer - 1 as new_display_order
  from public.page_instagram_videos as video
  left join image_counts on image_counts.page_key = video.page_key
  where video.page_key like 'food:%'
)
update public.page_instagram_videos as video
set display_order = ranked.new_display_order
from ranked_videos as ranked
where video.id = ranked.id
  and video.display_order is distinct from ranked.new_display_order;
