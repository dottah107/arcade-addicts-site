-- SCHEMA: profiles, uploads, activity, friendships, lounge_messages + storage policies

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  platform text,
  avatar_url text,
  banner_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.uploads (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  url text not null,
  kind text check (kind in (''image'',''video'')) default ''image'',
  title text,
  created_at timestamp with time zone default now()
);

create table if not exists public.activity (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  kind text check (kind in (''upload'',''note'')) default ''upload'',
  text text,
  content_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.friendships (
  id bigserial primary key,
  requester_id uuid references public.profiles(id) on delete cascade,
  addressee_id uuid references public.profiles(id) on delete cascade,
  status text check (status in (''pending'',''accepted'')) default ''pending'',
  created_at timestamp with time zone default now(),
  unique(requester_id, addressee_id)
);

create or replace view public.friendships_view as
select f.*,
  pr.username as requester_username,
  pa.username as addressee_username
from friendships f
left join profiles pr on pr.id = f.requester_id
left join profiles pa on pa.id = f.addressee_id;

-- your friends (accepted, symmetric)
create or replace view public.friends_of_user_view as
select
  case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end as friend_id,
  case when f.requester_id = auth.uid() then pa.username else pr.username end as username,
  auth.uid() as user_id
from friendships f
left join profiles pr on pr.id = f.requester_id
left join profiles pa on pa.id = f.addressee_id
where f.status = ''accepted'' and (f.requester_id = auth.uid() or f.addressee_id = auth.uid());

-- helper function to return friend ids for a given user
create or replace function public.get_friends_ids(p_user_id uuid)
returns uuid[]
language plpgsql security definer as $$
declare arr uuid[];
begin
  select array_agg( case when requester_id = p_user_id then addressee_id else requester_id end )
  into arr
  from friendships
  where status = 'accepted' and (requester_id = p_user_id or addressee_id = p_user_id);
  return coalesce(arr, '{}');
end $$;

-- activity view joined to usernames
create or replace view public.activity_view as
select a.*, p.username
from activity a
left join profiles p on p.id = a.user_id;

-- Lounge chat
create table if not exists public.lounge_messages (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamp with time zone default now()
);

create or replace view public.lounge_messages_view as
select m.*, p.username
from lounge_messages m
left join profiles p on p.id = m.user_id;

-- Storage: create bucket
-- (Do this one-time in Storage UI, name: user-content, public)
-- Or via RPC if you enable storage admin; UI is simpler.

-- RLS
alter table profiles enable row level security;
alter table uploads enable row level security;
alter table activity enable row level security;
alter table friendships enable row level security;
alter table lounge_messages enable row level security;

-- PROFILES
create policy "profiles_select_self_or_public" on profiles
for select using (true);

create policy "profiles_insert_self" on profiles
for insert with check (id = auth.uid());

create policy "profiles_update_self" on profiles
for update using (id = auth.uid());

-- UPLOADS
create policy "uploads_select_all" on uploads
for select using (true);

create policy "uploads_insert_owner" on uploads
for insert with check (user_id = auth.uid());

create policy "uploads_update_owner" on uploads
for update using (user_id = auth.uid());

create policy "uploads_delete_owner" on uploads
for delete using (user_id = auth.uid());

-- ACTIVITY
create policy "activity_select_all" on activity
for select using (true);

create policy "activity_cud_owner" on activity
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- FRIENDSHIPS
create policy "friendships_select_involving_me" on friendships
for select using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "friendships_insert_me_as_requester" on friendships
for insert with check (requester_id = auth.uid());

create policy "friendships_update_if_addressee" on friendships
for update using (addressee_id = auth.uid());

create policy "friendships_delete_if_involving_me" on friendships
for delete using (requester_id = auth.uid() or addressee_id = auth.uid());

-- LOUNGE
create policy "lounge_select_all" on lounge_messages
for select using (true);

create policy "lounge_insert_self" on lounge_messages
for insert with check (user_id = auth.uid());

create policy "lounge_owner_delete" on lounge_messages
for delete using (user_id = auth.uid());
