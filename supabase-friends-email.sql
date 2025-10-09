-- EMAIL-BASED FRIEND REQUESTS + HELPERS
-- Adds: send_friend_request_by_email(), get_incoming_requests(), get_my_friends()

create or replace function public.send_friend_request_by_email(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rid uuid;
begin
  if p_email is null or length(trim(p_email))=0 then
    raise exception 'Email required';
  end if;
  select id into rid
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if rid is null then
    raise exception 'No user with that email';
  end if;

  perform public.send_friend_request(rid);
end
$$;

-- list incoming pending requests with sender email
create or replace function public.get_incoming_requests()
returns table(id bigint, sender uuid, sender_email text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select fr.id, fr.sender,
         (select email from auth.users u where u.id = fr.sender) as sender_email,
         fr.created_at
  from public.friend_requests fr
  where fr.receiver = auth.uid()
    and fr.status = 'pending'
  order by fr.created_at desc
$$;

-- list my friends with their email
create or replace function public.get_my_friends()
returns table(friend_id uuid, friend_email text, since timestamptz)
language sql
security definer
set search_path = public
as $$
  select fl.friend_id,
         (select email from auth.users u where u.id = fl.friend_id) as friend_email,
         fl.created_at
  from public.friend_links fl
  where fl.user_id = auth.uid()
  order by fl.created_at desc
$$;
