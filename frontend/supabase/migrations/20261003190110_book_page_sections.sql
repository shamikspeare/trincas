-- Ordered, mixed text/image content for the public Books page.
create table if not exists public.book_page_sections (
  id uuid primary key default gen_random_uuid(),
  section_type text not null check (section_type in ('text', 'image')),
  display_order integer not null default 0 check (display_order >= 0),
  heading text,
  body text,
  image_url text,
  alt_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint book_page_sections_content_check check (
    (section_type = 'text' and image_url is null)
    or (section_type = 'image' and image_url is not null)
  )
);

create index if not exists book_page_sections_display_order_idx
  on public.book_page_sections (display_order);

alter table public.book_page_sections enable row level security;

-- Ensure the Data API roles can reach the table; RLS below limits rows/actions.
grant select on public.book_page_sections to anon, authenticated;
grant insert, update, delete on public.book_page_sections to authenticated;

drop policy if exists "Public read book page sections" on public.book_page_sections;
drop policy if exists "CMS verified admin insert book sections" on public.book_page_sections;
drop policy if exists "CMS verified admin update book sections" on public.book_page_sections;
drop policy if exists "CMS verified admin delete book sections" on public.book_page_sections;

create policy "Public read book page sections"
  on public.book_page_sections
  for select
  to anon, authenticated
  using (true);

create policy "CMS verified admin insert book sections"
  on public.book_page_sections
  for insert
  to authenticated
  with check (
    (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );

create policy "CMS verified admin update book sections"
  on public.book_page_sections
  for update
  to authenticated
  using (
    (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  )
  with check (
    (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );

create policy "CMS verified admin delete book sections"
  on public.book_page_sections
  for delete
  to authenticated
  using (
    (select auth.jwt() ->> 'email') in ('trincasrestaurant@gmail.com', 'gshamik14@gmail.com')
    and (select auth.jwt() -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );
