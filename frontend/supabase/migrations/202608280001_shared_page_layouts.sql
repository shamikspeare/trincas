-- Shared layout content is intentionally limited to Food, Music, and History.
-- Dining continues to use dining_page_sections and its original CMS.
create table if not exists public.page_layouts (
  page_key text primary key check (
    page_key ~ '^(food:[a-z0-9-]+|music|history:[0-9]{4})$'
  ),
  heading text,
  lead_image_url text,
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_image_cards (
  id uuid primary key default gen_random_uuid(),
  page_key text not null references public.page_layouts(page_key) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists page_image_cards_page_key_order_idx
  on public.page_image_cards (page_key, display_order);

create table if not exists public.page_instagram_videos (
  id uuid primary key default gen_random_uuid(),
  page_key text not null references public.page_layouts(page_key) on delete cascade,
  instagram_url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists page_instagram_videos_page_key_order_idx
  on public.page_instagram_videos (page_key, display_order);

insert into storage.buckets (id, name, public)
values ('page-content', 'page-content', true)
on conflict (id) do update set public = true;

alter table public.page_layouts enable row level security;
alter table public.page_image_cards enable row level security;
alter table public.page_instagram_videos enable row level security;

create policy "Public read page layouts" on public.page_layouts for select using (true);
create policy "Public read page image cards" on public.page_image_cards for select using (true);
create policy "Public read page instagram videos" on public.page_instagram_videos for select using (true);

-- The existing dashboard uses the anonymous Supabase client and has no login flow.
-- Keep these policies aligned with that current CMS access model.
create policy "CMS write page layouts" on public.page_layouts for all to anon, authenticated using (true) with check (true);
create policy "CMS write page image cards" on public.page_image_cards for all to anon, authenticated using (true) with check (true);
create policy "CMS write page instagram videos" on public.page_instagram_videos for all to anon, authenticated using (true) with check (true);
create policy "Public read page content images" on storage.objects for select using (bucket_id = 'page-content');
create policy "CMS write page content images" on storage.objects for all to anon, authenticated using (bucket_id = 'page-content') with check (bucket_id = 'page-content');
