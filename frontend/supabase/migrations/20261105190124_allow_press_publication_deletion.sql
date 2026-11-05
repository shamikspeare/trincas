-- Let authenticated CMS admins delete a publication name. The trigger clears
-- the denormalized legacy text as well as the foreign key so the deleted name
-- cannot reappear in the CMS or on the public Press page.
grant delete on table public.press_publications to authenticated;

drop policy if exists "CMS OTP admin delete press publications"
  on public.press_publications;

create policy "CMS OTP admin delete press publications"
  on public.press_publications
  for delete
  to authenticated
  using (
    ((select auth.jwt()) ->> 'email') in (
      'trincasrestaurant@gmail.com',
      'gshamik14@gmail.com',
      'presentedbypconsultancy@gmail.com'
    )
    and ((select auth.jwt()) -> 'amr' -> 0 ->> 'method') in ('otp', 'magiclink')
  );

create or replace function public.clear_deleted_press_publication()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.press_items
  set
    publication = null,
    publication_id = null
  where publication_id = old.id
    or lower(regexp_replace(btrim(publication), '[[:space:]]+', ' ', 'g')) = old.normalized_name;

  return old;
end;
$$;

revoke all on function public.clear_deleted_press_publication() from public, anon;
grant execute on function public.clear_deleted_press_publication() to authenticated;

drop trigger if exists clear_deleted_press_publication
  on public.press_publications;

create trigger clear_deleted_press_publication
before delete on public.press_publications
for each row
execute function public.clear_deleted_press_publication();
