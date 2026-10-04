-- Book in Lebanon — database schema.
-- Run once in Supabase: SQL Editor → New query → paste this file → Run.

create extension if not exists btree_gist;

-- ───────────────────────── Profiles ─────────────────────────

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  role text not null default 'guest' check (role in ('guest', 'host', 'admin')),
  avatar text,
  is_verified_host boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Create a profile row for every new auth user, from the sign-up form's metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, whatsapp, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'whatsapp', ''),
    case when new.raw_user_meta_data->>'role' = 'host' then 'host' else 'guest' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users may edit their own profile, but only an admin can grant admin or verification.
-- A guest may upgrade themselves to host.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- No signed-in user means a trusted context (SQL editor, service role).
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if not (old.role = 'guest' and new.role = 'host') then
    new.role := old.role;
  end if;
  new.is_verified_host := old.is_verified_host;
  new.email := old.email;
  return new;
end;
$$;

create trigger guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

alter table public.profiles enable row level security;

create policy "Read own profile or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "Update own profile or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- ───────────────────────── Listings ─────────────────────────

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles on delete cascade,
  title jsonb not null,
  category text not null,
  region text not null,
  city jsonb not null,
  address text not null default '',
  price_usd numeric not null check (price_usd >= 0),
  price_unit text not null default 'per_night',
  images text[] not null default '{}',
  videos text[] not null default '{}',
  description jsonb not null,
  amenities text[] not null default '{}',
  max_guests int,
  bedrooms int,
  bathrooms int,
  lat double precision,
  lng double precision,
  host_name text not null default '',
  host_phone text not null default '',
  host_whatsapp text not null default '',
  host_verified boolean not null default false,
  featured boolean not null default false,
  promotion_tier text,
  promoted_until date,
  created_at timestamptz not null default now()
);

create index listings_owner_idx on public.listings (owner_id);

-- Only admins can feature, promote or verify a listing.
create or replace function public.guard_listing_write()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.owner_id := auth.uid();
      new.featured := false;
      new.promotion_tier := null;
      new.promoted_until := null;
      new.host_verified := coalesce(
        (select is_verified_host from public.profiles where id = auth.uid()), false);
      new.created_at := now();
    else
      new.owner_id := old.owner_id;
      new.featured := old.featured;
      new.promotion_tier := old.promotion_tier;
      new.promoted_until := old.promoted_until;
      new.host_verified := old.host_verified;
      new.created_at := old.created_at;
    end if;
  end if;
  return new;
end;
$$;

create trigger guard_listing_write
  before insert or update on public.listings
  for each row execute function public.guard_listing_write();

-- Verifying a host flags all of their listings.
create or replace function public.sync_host_verified()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.is_verified_host is distinct from old.is_verified_host then
    update public.listings set host_verified = new.is_verified_host where owner_id = new.id;
  end if;
  return new;
end;
$$;

create trigger sync_host_verified
  after update on public.profiles
  for each row execute function public.sync_host_verified();

alter table public.listings enable row level security;

create policy "Anyone can read listings" on public.listings
  for select using (true);
create policy "Signed-in users create own listings" on public.listings
  for insert to authenticated with check (owner_id = auth.uid());
create policy "Owner or admin updates listing" on public.listings
  for update using (owner_id = auth.uid() or public.is_admin());
create policy "Owner or admin deletes listing" on public.listings
  for delete using (owner_id = auth.uid() or public.is_admin());

-- ───────────────────────── Reviews ─────────────────────────

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now()
);

create index reviews_listing_idx on public.reviews (listing_id);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews" on public.reviews
  for select using (true);
create policy "Signed-in users write own reviews" on public.reviews
  for insert to authenticated with check (author_id = auth.uid());
create policy "Author or admin deletes review" on public.reviews
  for delete using (author_id = auth.uid() or public.is_admin());

-- ───────────────────────── Bookings ─────────────────────────

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  listing_id uuid not null references public.listings on delete cascade,
  guest_id uuid not null references public.profiles on delete cascade,
  host_id uuid not null references public.profiles on delete cascade,
  listing_title text not null,
  listing_image text not null default '',
  category text not null,
  city text not null default '',
  guest_name text not null,
  guest_phone text not null,
  guest_email text not null,
  check_in date not null,
  check_out date,
  reservation_time text,
  guests_count int not null default 1,
  nights_count int not null default 1,
  price_per_night_usd numeric not null,
  subtotal_usd numeric not null,
  service_fee_usd numeric not null default 0,
  total_usd numeric not null,
  total_lbp numeric not null,
  payment_method text,
  payment_reference text,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined', 'cancelled')),
  blocks_dates boolean not null default true,
  created_at timestamptz not null default now(),
  check (check_out is null or check_out > check_in),
  -- Two confirmed stays can never overlap on the same listing.
  constraint no_double_booking exclude using gist (
    listing_id with =,
    daterange(check_in, coalesce(check_out, check_in + 1)) with &&
  ) where (status = 'confirmed' and blocks_dates)
);

create index bookings_guest_idx on public.bookings (guest_id);
create index bookings_host_idx on public.bookings (host_id);

create or replace function public.guard_booking_write()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  listing_owner uuid;
  listing_category text;
begin
  if tg_op = 'INSERT' then
    select owner_id, category into listing_owner, listing_category
      from public.listings where id = new.listing_id;
    if listing_owner is null then
      raise exception 'Listing not found';
    end if;
    new.guest_id := auth.uid();
    new.host_id := listing_owner;
    new.category := listing_category;
    new.blocks_dates := listing_category <> 'restaurant';
    new.status := 'pending';
    new.created_at := now();
    return new;
  end if;

  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  -- Only the status may change after a booking is made.
  if (to_jsonb(new) - 'status') <> (to_jsonb(old) - 'status') then
    raise exception 'Only the booking status can be changed';
  end if;

  if new.status is distinct from old.status then
    if auth.uid() = old.host_id
       and new.status in ('confirmed', 'declined', 'cancelled') then
      return new;
    end if;
    if auth.uid() = old.guest_id and new.status = 'cancelled' then
      return new;
    end if;
    raise exception 'Not allowed to change this booking';
  end if;
  return new;
end;
$$;

create trigger guard_booking_write
  before insert or update on public.bookings
  for each row execute function public.guard_booking_write();

alter table public.bookings enable row level security;

create policy "Guest, host or admin reads booking" on public.bookings
  for select using (guest_id = auth.uid() or host_id = auth.uid() or public.is_admin());
create policy "Signed-in users request bookings" on public.bookings
  for insert to authenticated with check (true);
create policy "Guest, host or admin updates booking" on public.bookings
  for update using (guest_id = auth.uid() or host_id = auth.uid() or public.is_admin());

-- Booked nights are public (without guest details) so calendars can grey them out.
create or replace function public.booked_ranges()
returns table (listing_id uuid, check_in date, check_out date)
language sql stable security definer set search_path = public
as $$
  select listing_id, check_in, coalesce(check_out, check_in + 1)
  from public.bookings
  where status = 'confirmed' and blocks_dates and coalesce(check_out, check_in + 1) >= current_date;
$$;

grant execute on function public.booked_ranges() to anon, authenticated;

-- ───────────────────────── Chat ─────────────────────────

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings on delete cascade,
  guest_id uuid not null references public.profiles on delete cascade,
  host_id uuid not null references public.profiles on delete cascade,
  guest_name text not null default '',
  host_name text not null default '',
  created_at timestamptz not null default now(),
  unique (listing_id, guest_id)
);

create or replace function public.guard_conversation_insert()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  select owner_id, host_name into new.host_id, new.host_name
    from public.listings where id = new.listing_id;
  if new.host_id is null then
    raise exception 'Listing not found';
  end if;
  new.guest_id := auth.uid();
  if new.guest_id = new.host_id then
    raise exception 'You cannot message your own listing';
  end if;
  select name into new.guest_name from public.profiles where id = auth.uid();
  return new;
end;
$$;

create trigger guard_conversation_insert
  before insert on public.conversations
  for each row execute function public.guard_conversation_insert();

alter table public.conversations enable row level security;

create policy "Participants read conversation" on public.conversations
  for select using (guest_id = auth.uid() or host_id = auth.uid());
create policy "Signed-in users start conversations" on public.conversations
  for insert to authenticated with check (true);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles on delete cascade,
  type text not null default 'text' check (type in ('text', 'image', 'video', 'audio', 'call_log')),
  text text,
  media_url text,
  media_duration int,
  file_name text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

create or replace function public.is_conversation_participant(conv uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.conversations
    where id = conv and (guest_id = auth.uid() or host_id = auth.uid())
  );
$$;

alter table public.messages enable row level security;

create policy "Participants read messages" on public.messages
  for select using (public.is_conversation_participant(conversation_id));
create policy "Participants send messages" on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid() and public.is_conversation_participant(conversation_id));

create or replace function public.mark_conversation_read(conv uuid)
returns void
language sql security definer set search_path = public
as $$
  update public.messages set read_at = now()
  where conversation_id = conv
    and sender_id <> auth.uid()
    and read_at is null
    and public.is_conversation_participant(conv);
$$;

grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- ───────────────────────── Notifications ─────────────────────────

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  kind text not null,
  data jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Read own notifications" on public.notifications
  for select using (user_id = auth.uid());
create policy "Update own notifications" on public.notifications
  for update using (user_id = auth.uid());
create policy "Delete own notifications" on public.notifications
  for delete using (user_id = auth.uid());

create or replace function public.notify_booking_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  payload jsonb := jsonb_build_object(
    'booking_id', new.id,
    'reference', new.reference,
    'listing_id', new.listing_id,
    'listing_title', new.listing_title,
    'guest_name', new.guest_name,
    'check_in', new.check_in,
    'status', new.status
  );
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, kind, data)
    values (new.host_id, 'booking_requested', payload);
  elsif new.status is distinct from old.status then
    if auth.uid() = new.guest_id then
      insert into public.notifications (user_id, kind, data)
      values (new.host_id, 'booking_' || new.status, payload);
    else
      insert into public.notifications (user_id, kind, data)
      values (new.guest_id, 'booking_' || new.status, payload);
    end if;
  end if;
  return new;
end;
$$;

create trigger notify_booking_change
  after insert or update on public.bookings
  for each row execute function public.notify_booking_change();

create or replace function public.admin_broadcast(title text, message text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  insert into public.notifications (user_id, kind, data)
  select id, 'broadcast', jsonb_build_object('title', title, 'message', message)
  from public.profiles;
end;
$$;

grant execute on function public.admin_broadcast(text, text) to authenticated;

-- ───────────────────────── Promotion requests ─────────────────────────

create table public.promotion_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  tier text not null,
  days int not null,
  price_usd numeric not null,
  payment_method text not null,
  payment_reference text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.promotion_requests enable row level security;

create policy "Owner or admin reads promotion requests" on public.promotion_requests
  for select using (user_id = auth.uid() or public.is_admin());
create policy "Listing owner requests promotion" on public.promotion_requests
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (select 1 from public.listings where id = listing_id and owner_id = auth.uid())
  );
create policy "Admin updates promotion requests" on public.promotion_requests
  for update using (public.is_admin());

-- ───────────────────────── Storage (photos, videos, voice notes) ─────────────────────────

insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800)
on conflict (id) do nothing;

create policy "Users upload into their own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete their own files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- ───────────────────────── Realtime ─────────────────────────

alter publication supabase_realtime add table public.messages, public.conversations,
  public.bookings, public.notifications;
