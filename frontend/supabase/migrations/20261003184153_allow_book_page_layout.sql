-- Allow the shared CMS layout to be used by the public Books page.
alter table public.page_layouts
  drop constraint if exists page_layouts_page_key_check;

alter table public.page_layouts
  add constraint page_layouts_page_key_check
  check (
    page_key ~ '^(food:[a-z0-9-]+|music|music-schedule|music-tavern-schedule|history:[0-9]{4}|book)$'
  );
