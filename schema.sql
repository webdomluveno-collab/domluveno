-- Domluveno — Supabase / Postgres schema (MVP)
-- Spustit v Supabase SQL editoru. Predpoklad: pgcrypto k dispozici (defaultne ano).

create extension if not exists "pgcrypto";
create schema if not exists private;

-- ============ events ============
create table if not exists public.events (
  id text primary key, -- verejny, nehadatelny: napr. 'patecni-pivo-x7k2' (slug + nanoid 4-6)
  title text not null check (char_length(title) between 2 and 80),
  emoji text not null default '✨',
  organizer_name text not null default 'Organizátor' check (char_length(organizer_name) <= 40),
  show_results boolean not null default true,
  status text not null default 'open' check (status in ('open','confirmed')),
  confirmed_option_id uuid null,
  confirmed_place_id uuid null,
  created_at timestamptz not null default now(),
  expires_at timestamptz null
);

-- ============ date options ============
create table if not exists public.date_options (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  label text not null,        -- 'Sobota 26. 9.'
  day_short text not null,    -- 'So 26. 9.'
  time text not null,         -- '19:00' (validuje API: ^([01][0-9]|2[0-3]):[0-5][0-9]$)
  sort int not null default 0
);
create index if not exists idx_date_options_event on public.date_options (event_id, sort);

-- ============ place options ============
create table if not exists public.place_options (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 60)
);
create index if not exists idx_place_options_event on public.place_options (event_id);

-- ============ votes (jeden radek = jeden host) ============
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  voter_name text not null check (char_length(voter_name) between 1 and 30),
  voter_token_hash text not null, -- sha256(editacniho tokenu), umozni hostu upravit vlastni hlas
  ip_hash text null,               -- sha256(ip + salt) jen pro rate-limit, ne PII
  created_at timestamptz not null default now(),
  unique(event_id, voter_token_hash)
);
create index if not exists idx_votes_event on public.votes (event_id);

-- ============ vote choices ============
create table if not exists public.vote_choices (
  vote_id uuid not null references public.votes(id) on delete cascade,
  option_id uuid not null references public.date_options(id) on delete cascade,
  value text not null check (value in ('yes','maybe','no')),
  primary key (vote_id, option_id)
);

create table if not exists public.place_votes (
  vote_id uuid not null references public.votes(id) on delete cascade,
  place_id uuid not null references public.place_options(id) on delete cascade,
  primary key (vote_id, place_id)
);

-- ============ organizer secrets (NIKDO verejne necete) ============
create table if not exists private.event_secrets (
  event_id text primary key references public.events(id) on delete cascade,
  admin_token_hash text not null,
  created_at timestamptz not null default now()
);
-- schema private neni vystavene pres PostgREST; pristup jen pres service_role / RPC security definer.

-- ============ rate limit ============
create table if not exists public.rate_limits (
  key text primary key, -- 'vote:<ip_hash>:<hour>'
  count int not null default 1,
  updated_at timestamptz not null default now()
);

-- ============ RLS ============
alter table public.events enable row level security;
alter table public.date_options enable row level security;
alter table public.place_options enable row level security;
alter table public.votes enable row level security;
alter table public.vote_choices enable row level security;
alter table public.place_votes enable row level security;
alter table public.rate_limits enable row level security;
-- rate_limits: zadne politiky = pristup jen pres RPC (security definer RLS obchazi)

-- Verejne cteni eventu a moznosti: kdokoli se spravnym odkazem (id je nehadatelne).
drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events for select using (true);
drop policy if exists "public read date_options" on public.date_options;
create policy "public read date_options" on public.date_options for select using (true);
drop policy if exists "public read place_options" on public.place_options;
create policy "public read place_options" on public.place_options for select using (true);

-- Hlasy: cist jen kdyz event dovoluje vysledky. Zapis jen pres RPC (zadny prime insert z klienta).
drop policy if exists "read votes if show_results" on public.votes;
create policy "read votes if show_results"
  on public.votes for select using (
    exists (select 1 from public.events e where e.id = votes.event_id and e.show_results = true)
  );
drop policy if exists "read choices if show_results" on public.vote_choices;
create policy "read choices if show_results"
  on public.vote_choices for select using (
    exists (select 1 from public.votes v join public.events e on e.id = v.event_id
            where v.id = vote_choices.vote_id and e.show_results = true)
  );
drop policy if exists "read place_votes if show_results" on public.place_votes;
create policy "read place_votes if show_results"
  on public.place_votes for select using (
    exists (select 1 from public.votes v join public.events e on e.id = v.event_id
            where v.id = place_votes.vote_id and e.show_results = true)
  );
-- zadne prime insert/update/delete politiky = klient musi pres RPC funkce nize.

-- ============ RPC: vytvorit event (serverove vygeneruje id) ============
create or replace function public.create_event(
  p_title text, p_emoji text, p_organizer text,
  p_dates jsonb, -- [{label, day_short, time}]
  p_places jsonb default '[]'::jsonb, -- ["Lokal", ...]
  p_show_results boolean default true
) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare v_slug text; v_id text; v_admin text; d jsonb; i int := 0;
begin
  if char_length(p_title) < 2 or char_length(p_title) > 80 then raise exception 'bad title'; end if;
  if jsonb_array_length(p_dates) < 1 or jsonb_array_length(p_dates) > 20 then raise exception 'bad dates'; end if;
  v_slug := regexp_replace(lower(public.unaccent_safe(p_title)), '[^a-z0-9]+', '-', 'g');
  v_slug := substring(btrim(v_slug, '-') from 1 for 24);
  if v_slug = '' then v_slug := 'plan'; end if;
  v_id := v_slug || '-' || substring(encode(gen_random_bytes(4), 'hex') from 1 for 4);
  v_admin := encode(gen_random_bytes(24), 'hex');
  insert into public.events(id, title, emoji, organizer_name, show_results)
  values (v_id, p_title, coalesce(p_emoji,'✨'), coalesce(p_organizer,'Organizátor'), p_show_results);
  for d in select * from jsonb_array_elements(p_dates) loop
    if d->>'time' !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'bad time'; end if;
    insert into public.date_options(event_id, label, day_short, time, sort)
    values (v_id, d->>'label', d->>'day_short', d->>'time', i); i := i + 1;
  end loop;
  for d in select * from jsonb_array_elements(p_places) loop
    insert into public.place_options(event_id, label) values (v_id, substring(d #>> '{}', 1, 60));
  end loop;
  insert into private.event_secrets(event_id, admin_token_hash)
  values (v_id, encode(digest(v_admin, 'sha256'), 'hex'));
  return jsonb_build_object('id', v_id, 'admin_token', v_admin);
end $$;

-- pomocna bez extenze unaccent
create or replace function public.unaccent_safe(t text) returns text
language plpgsql immutable as $$
begin
  t := translate(lower(t),
    'áčďéěíňóřšťúůýžàáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
    'acdeeinorstuuyzaaaaaceeeeiiiinooooouuuuyy');
  return t;
end $$;

-- ============ RPC: hlasovat (s rate limitem) ============
create or replace function public.cast_vote(
  p_event text, p_name text, p_token text,
  p_choices jsonb, -- [{option_id, value}]
  p_place_ids uuid[] default '{}',
  p_ip_hash text default null
) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare v_vote uuid; c jsonb; v_opt uuid; v_cnt int;
begin
  if char_length(p_name) < 1 or char_length(p_name) > 30 then raise exception 'bad name'; end if;
  if jsonb_array_length(p_choices) < 1 or jsonb_array_length(p_choices) > 40 then raise exception 'bad choices'; end if;
  if p_ip_hash is not null then
    insert into public.rate_limits(key, count) values ('vote:'||p_ip_hash, 1)
    on conflict (key) do update set count = rate_limits.count + 1, updated_at = now()
    returning count into v_cnt;
    if v_cnt > 60 then raise exception 'rate limited'; end if;
  end if;
  if not exists (select 1 from public.events where id = p_event and status = 'open') then raise exception 'event closed'; end if;
  insert into public.votes(event_id, voter_name, voter_token_hash, ip_hash)
  values (p_event, p_name, encode(digest(p_token,'sha256'),'hex'), p_ip_hash)
  on conflict (event_id, voter_token_hash) do update set voter_name = excluded.voter_name, created_at = now()
  returning id into v_vote;
  delete from public.vote_choices where vote_id = v_vote;
  for c in select * from jsonb_array_elements(p_choices) loop
    v_opt := (c->>'option_id')::uuid;
    if not exists (select 1 from public.date_options where id = v_opt and event_id = p_event) then raise exception 'bad option'; end if;
    if (c->>'value') not in ('yes','maybe','no') then raise exception 'bad value'; end if;
    insert into public.vote_choices(vote_id, option_id, value) values (v_vote, v_opt, c->>'value')
    on conflict do nothing;
  end loop;
  delete from public.place_votes where vote_id = v_vote;
  if array_length(p_place_ids, 1) > 0 then
    insert into public.place_votes(vote_id, place_id)
    select v_vote, pid from unnest(p_place_ids) pid
    where exists (select 1 from public.place_options po where po.id = pid and po.event_id = p_event);
  end if;
  return v_vote;
end $$;

-- ============ RPC: potvrdit vítěze (jen organizátor s admin tokenem) ============
create or replace function public.confirm_event(
  p_event text, p_admin_token text,
  p_option_id uuid default null, p_place_id uuid default null
) returns void
language plpgsql security definer set search_path = public, private, extensions as $$
begin
  if not exists (
    select 1 from private.event_secrets s
    where s.event_id = p_event
      and s.admin_token_hash = encode(digest(p_admin_token, 'sha256'), 'hex')
  ) then raise exception 'forbidden'; end if;
  if p_option_id is not null and not exists (
    select 1 from public.date_options where id = p_option_id and event_id = p_event
  ) then raise exception 'bad option'; end if;
  if p_place_id is not null and not exists (
    select 1 from public.place_options where id = p_place_id and event_id = p_event
  ) then raise exception 'bad place'; end if;
  update public.events
  set status = 'confirmed', confirmed_option_id = p_option_id, confirmed_place_id = p_place_id
  where id = p_event;
end $$;
