-- CMS authorization hardening for the current Trinca's schema.
--
-- This does not remove the existing public-read policies or overwrite unknown
-- policies. Instead, it adds restrictive write policies. Restrictive policies
-- are ANDed with the current permissive policies, so they block every CMS write
-- unless the request is from one of the two administrators *and* the current
-- Supabase Auth session was created by an email link (not the transient password
-- verification session).
--
-- Confirmed tables: food_cuisines, food_pages, food_dishes, dining,
-- dining_pages_texts, dining_cards, dining_page_sections, history_content,
-- history_images, page_layouts, page_image_cards, page_instagram_videos,
-- press_items.

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'food_cuisines', 'food_pages', 'food_dishes', 'dining',
    'dining_pages_texts', 'dining_cards', 'dining_page_sections',
    'history_content', 'history_images', 'page_layouts',
    'page_image_cards', 'page_instagram_videos', 'press_items'
  ]
  loop
    execute format('alter table public.%I enable row level security', target_table);

    execute format('drop policy if exists %I on public.%I', 'CMS OTP admin insert', target_table);
    execute format('drop policy if exists %I on public.%I', 'CMS OTP admin update', target_table);
    execute format('drop policy if exists %I on public.%I', 'CMS OTP admin delete', target_table);

    execute format(
      'create policy %I on public.%I as restrictive for insert to public with check (\n        (select auth.jwt() ->> ''email'') in (''trincasrestaurant@gmail.com'', ''gshamik14@gmail.com'')\n        and (select auth.jwt() -> ''amr'' -> 0 ->> ''method'') in (''otp'', ''magiclink'')\n      )',
      'CMS OTP admin insert', target_table
    );
    execute format(
      'create policy %I on public.%I as restrictive for update to public using (\n        (select auth.jwt() ->> ''email'') in (''trincasrestaurant@gmail.com'', ''gshamik14@gmail.com'')\n        and (select auth.jwt() -> ''amr'' -> 0 ->> ''method'') in (''otp'', ''magiclink'')\n      ) with check (\n        (select auth.jwt() ->> ''email'') in (''trincasrestaurant@gmail.com'', ''gshamik14@gmail.com'')\n        and (select auth.jwt() -> ''amr'' -> 0 ->> ''method'') in (''otp'', ''magiclink'')\n      )',
      'CMS OTP admin update', target_table
    );
    execute format(
      'create policy %I on public.%I as restrictive for delete to public using (\n        (select auth.jwt() ->> ''email'') in (''trincasrestaurant@gmail.com'', ''gshamik14@gmail.com'')\n        and (select auth.jwt() -> ''amr'' -> 0 ->> ''method'') in (''otp'', ''magiclink'')\n      )',
      'CMS OTP admin delete', target_table
    );
  end loop;
end $$;

-- Storage buckets confirmed in the connected project:
-- dining, food, history-images, page-content, press-images.
-- Existing public-read policies remain untouched. These restrictive policies
-- make anonymous and password-only uploads, replacements and deletes fail.
drop policy if exists "CMS OTP admin storage insert" on storage.objects;
drop policy if exists "CMS OTP admin storage update" on storage.objects;
drop policy if exists "CMS OTP admin storage delete" on storage.objects;

create policy "CMS OTP admin storage insert"
  on storage.objects as restrictive for insert to public
  with check (
    bucket_id in ('dining', 'food', 'history-images', 'page-content', 'press-images')
    and (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );

create policy "CMS OTP admin storage update"
  on storage.objects as restrictive for update to public
  using (
    bucket_id in ('dining', 'food', 'history-images', 'page-content', 'press-images')
    and (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  )
  with check (
    bucket_id in ('dining', 'food', 'history-images', 'page-content', 'press-images')
    and (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );

create policy "CMS OTP admin storage delete"
  on storage.objects as restrictive for delete to public
  using (
    bucket_id in ('dining', 'food', 'history-images', 'page-content', 'press-images')
    and (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );
