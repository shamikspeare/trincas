-- Add the third approved CMS administrator to all database and storage write policies.
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
    execute format('drop policy if exists %I on public.%I', 'CMS OTP admin insert', target_table);
    execute format('drop policy if exists %I on public.%I', 'CMS OTP admin update', target_table);
    execute format('drop policy if exists %I on public.%I', 'CMS OTP admin delete', target_table);

    execute format(
      'create policy %I on public.%I as restrictive for insert to public with check (
        (select auth.jwt() ->> ''email'') in (''trincasrestaurant@gmail.com'', ''gshamik14@gmail.com'', ''presentedbypconsultancy@gmail.com'')
        and (select auth.jwt() -> ''amr'' -> 0 ->> ''method'') in (''otp'', ''magiclink'')
      )',
      'CMS OTP admin insert', target_table
    );
    execute format(
      'create policy %I on public.%I as restrictive for update to public using (
        (select auth.jwt() ->> ''email'') in (''trincasrestaurant@gmail.com'', ''gshamik14@gmail.com'', ''presentedbypconsultancy@gmail.com'')
        and (select auth.jwt() -> ''amr'' -> 0 ->> ''method'') in (''otp'', ''magiclink'')
      ) with check (
        (select auth.jwt() ->> ''email'') in (''trincasrestaurant@gmail.com'', ''gshamik14@gmail.com'', ''presentedbypconsultancy@gmail.com'')
        and (select auth.jwt() -> ''amr'' -> 0 ->> ''method'') in (''otp'', ''magiclink'')
      )',
      'CMS OTP admin update', target_table
    );
    execute format(
      'create policy %I on public.%I as restrictive for delete to public using (
        (select auth.jwt() ->> ''email'') in (''trincasrestaurant@gmail.com'', ''gshamik14@gmail.com'', ''presentedbypconsultancy@gmail.com'')
        and (select auth.jwt() -> ''amr'' -> 0 ->> ''method'') in (''otp'', ''magiclink'')
      )',
      'CMS OTP admin delete', target_table
    );
  end loop;
end $$;

drop policy if exists "CMS verified admin insert book sections" on public.book_page_sections;
drop policy if exists "CMS verified admin update book sections" on public.book_page_sections;
drop policy if exists "CMS verified admin delete book sections" on public.book_page_sections;

create policy "CMS verified admin insert book sections"
  on public.book_page_sections for insert to authenticated
  with check (
    (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com', 'presentedbypconsultancy@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );

create policy "CMS verified admin update book sections"
  on public.book_page_sections for update to authenticated
  using (
    (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com', 'presentedbypconsultancy@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  )
  with check (
    (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com', 'presentedbypconsultancy@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );

create policy "CMS verified admin delete book sections"
  on public.book_page_sections for delete to authenticated
  using (
    (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com', 'presentedbypconsultancy@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );

drop policy if exists "CMS OTP admin storage insert" on storage.objects;
drop policy if exists "CMS OTP admin storage update" on storage.objects;
drop policy if exists "CMS OTP admin storage delete" on storage.objects;

create policy "CMS OTP admin storage insert"
  on storage.objects as restrictive for insert to public
  with check (
    bucket_id in ('dining', 'food', 'history-images', 'page-content', 'press-images')
    and (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com', 'presentedbypconsultancy@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );

create policy "CMS OTP admin storage update"
  on storage.objects as restrictive for update to public
  using (
    bucket_id in ('dining', 'food', 'history-images', 'page-content', 'press-images')
    and (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com', 'presentedbypconsultancy@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  )
  with check (
    bucket_id in ('dining', 'food', 'history-images', 'page-content', 'press-images')
    and (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com', 'presentedbypconsultancy@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );

create policy "CMS OTP admin storage delete"
  on storage.objects as restrictive for delete to public
  using (
    bucket_id in ('dining', 'food', 'history-images', 'page-content', 'press-images')
    and (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com', 'presentedbypconsultancy@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );
