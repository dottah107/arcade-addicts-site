-- TABLES
create table if not exists public.posts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text,
  media_url text,
  media_type text check (media_type in ('image','video') or media_type is null),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.posts enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='posts_select_all') then
    create policy posts_select_all on public.posts for select using ( true );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='posts_insert_own') then
    create policy posts_insert_own on public.posts for insert with check ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='posts_delete_own') then
    create policy posts_delete_own on public.posts for delete using ( auth.uid() = user_id );
  end if;
end$$;

-- STORAGE bucket
insert into storage.buckets (id, name, public)
values ('highlights','highlights', true)
on conflict (id) do nothing;

-- STORAGE policies for bucket 'highlights'
do $$
begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='hl_public_read') then
    create policy hl_public_read on storage.objects for select using ( bucket_id = 'highlights' );
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='hl_user_insert_own_folder') then
    create policy hl_user_insert_own_folder on storage.objects
      for insert to authenticated
      with check ( bucket_id = 'highlights' and (auth.uid()::text = split_part(name,'/',1)) );
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='hl_user_delete_own') then
    create policy hl_user_delete_own on storage.objects
      for delete to authenticated
      using ( bucket_id = 'highlights' and (auth.uid()::text = split_part(name,'/',1)) );
  end if;
end$$;
