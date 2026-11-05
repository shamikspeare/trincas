-- Canonical publication registry for Press filtering and CMS reuse.
-- Keep press_items.publication for backwards compatibility with older clients.
create table if not exists public.press_publications (
  id bigint generated always as identity primary key,
  name text not null,
  normalized_name text not null unique,
  created_at timestamptz not null default now(),
  constraint press_publications_name_length_check
    check (char_length(name) between 1 and 160),
  constraint press_publications_name_format_check
    check (name = regexp_replace(btrim(name), '[[:space:]]+', ' ', 'g')),
  constraint press_publications_normalized_name_check
    check (
      normalized_name = lower(regexp_replace(btrim(name), '[[:space:]]+', ' ', 'g'))
    )
);

alter table public.press_items
  add column if not exists publication_id bigint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'press_items_publication_id_fkey'
      and conrelid = 'public.press_items'::regclass
  ) then
    alter table public.press_items
      add constraint press_items_publication_id_fkey
      foreign key (publication_id)
      references public.press_publications(id)
      on delete set null;
  end if;
end
$$;

create index if not exists press_items_publication_id_idx
  on public.press_items (publication_id);

-- Preserve every legacy press row while registering its non-empty publication.
with legacy_publications as (
  select distinct on (normalized_name)
    cleaned_name as name,
    normalized_name
  from (
    select
      regexp_replace(btrim(publication), '[[:space:]]+', ' ', 'g') as cleaned_name,
      lower(regexp_replace(btrim(publication), '[[:space:]]+', ' ', 'g')) as normalized_name,
      sort_order,
      created_at,
      id
    from public.press_items
    where nullif(regexp_replace(btrim(publication), '[[:space:]]+', ' ', 'g'), '') is not null
  ) cleaned
  order by normalized_name, sort_order, created_at, id
)
insert into public.press_publications (name, normalized_name)
select name, normalized_name
from legacy_publications
on conflict (normalized_name) do nothing;

update public.press_items as item
set publication_id = publication.id
from public.press_publications as publication
where item.publication_id is null
  and nullif(regexp_replace(btrim(item.publication), '[[:space:]]+', ' ', 'g'), '') is not null
  and publication.normalized_name = lower(
    regexp_replace(btrim(item.publication), '[[:space:]]+', ' ', 'g')
  );

alter table public.press_publications enable row level security;

revoke all on table public.press_publications from anon, authenticated;
grant select on table public.press_publications to anon, authenticated;
grant insert on table public.press_publications to authenticated;
grant usage, select on sequence public.press_publications_id_seq to authenticated;

drop policy if exists "Public read press publications" on public.press_publications;
drop policy if exists "CMS OTP admin insert press publications" on public.press_publications;

create policy "Public read press publications"
  on public.press_publications
  for select
  to anon, authenticated
  using (true);

create policy "CMS OTP admin insert press publications"
  on public.press_publications
  for insert
  to authenticated
  with check (
    ((select auth.jwt()) ->> 'email') in (
      'trincasrestaurant@gmail.com',
      'gshamik14@gmail.com',
      'presentedbypconsultancy@gmail.com'
    )
    and ((select auth.jwt()) -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );
