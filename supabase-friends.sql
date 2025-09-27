-- === profiles (public view of users) ===
create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_select_all') then
    create policy profiles_select_all on public.profiles for select using ( true );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_upsert_self') then
    create policy profiles_upsert_self on public.profiles for
      insert with check ( auth.uid() = id );
    create policy profiles_update_self on public.profiles for
      update using ( auth.uid() = id ) with check ( auth.uid() = id );
  end if;
end$$;

-- === friend_requests ===
create table if not exists public.friend_requests(
  id bigserial primary key,
  from_id uuid not null references auth.users(id) on delete cascade,
  to_id   uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  unique(from_id, to_id)
);

create index if not exists fr_to_status_idx   on public.friend_requests(to_id, status, created_at desc);
create index if not exists fr_from_status_idx on public.friend_requests(from_id, status, created_at desc);

alter table public.friend_requests enable row level security;

do $$
begin
  -- You can see requests that involve you (either side)
  if not exists (select 1 from pg_policies where tablename='friend_requests' and policyname='fr_select_involving_me') then
    create policy fr_select_involving_me on public.friend_requests
      for select using ( auth.uid() = from_id or auth.uid() = to_id );
  end if;

  -- You can create a request only as yourself, and not to yourself
  if not exists (select 1 from pg_policies where tablename='friend_requests' and policyname='fr_insert_self_sender') then
    create policy fr_insert_self_sender on public.friend_requests
      for insert with check ( auth.uid() = from_id and from_id <> to_id );
  end if;

  -- Only the recipient can accept/decline
  if not exists (select 1 from pg_policies where tablename='friend_requests' and policyname='fr_update_recipient_only') then
    create policy fr_update_recipient_only on public.friend_requests
      for update using ( auth.uid() = to_id );
  end if;

  -- Either side can delete (cancel / unfriend)
  if not exists (select 1 from pg_policies where tablename='friend_requests' and policyname='fr_delete_involving_me') then
    create policy fr_delete_involving_me on public.friend_requests
      for delete using ( auth.uid() = from_id or auth.uid() = to_id );
  end if;
end$$;
