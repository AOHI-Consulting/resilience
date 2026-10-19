-- Hotelschool Resilience Room (LDD class 8 demo): live resilience reports from classmates' phones.
-- Lives in the free Supabase project block-a-notes (ref fziyuauwrfdmiomwelij), next to the notes and OnsAms tables.
-- Anyone can add a report and read the feed. Hiding a report needs the presenter code.
-- The table has row level security and no policies: only these functions touch it.
-- Run once in the SQL editor; running it again is safe.

create table if not exists public.resilience_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  pillar text not null,
  campus text not null,
  severity smallint not null,
  note text not null,
  hidden boolean not null default false
);
alter table public.resilience_reports enable row level security;

create or replace function public.resilience_report(p_pillar text, p_campus text, p_severity int, p_note text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_pillar not in ('cyber','learning','campus','people','finance','reputation') then raise exception 'bad pillar'; end if;
  if p_campus not in ('The Hague','Amsterdam','Both') then raise exception 'bad campus'; end if;
  if p_severity not between 1 and 3 then raise exception 'bad severity'; end if;
  if length(trim(coalesce(p_note, ''))) < 3 then raise exception 'note too short'; end if;
  if (select count(*) from resilience_reports) >= 2000 then raise exception 'report store is full'; end if;
  insert into resilience_reports (pillar, campus, severity, note)
    values (p_pillar, p_campus, p_severity, left(trim(p_note), 240))
    returning id into v_id;
  return v_id;
end $$;

create or replace function public.resilience_feed()
returns table (id uuid, created_at timestamptz, pillar text, campus text, severity smallint, note text)
language sql security definer set search_path = public as $$
  select r.id, r.created_at, r.pillar, r.campus, r.severity, r.note
  from resilience_reports r where not r.hidden order by r.created_at desc limit 200;
$$;

create or replace function public.resilience_hide(p_code text, p_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if upper(coalesce(p_code, '')) <> 'LDD8' then raise exception 'wrong code'; end if;
  update resilience_reports set hidden = true where id = p_id;
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.resilience_report(text, text, int, text) from public;
revoke all on function public.resilience_feed() from public;
revoke all on function public.resilience_hide(text, uuid) from public;
grant execute on function public.resilience_report(text, text, int, text) to anon, authenticated;
grant execute on function public.resilience_feed() to anon, authenticated;
grant execute on function public.resilience_hide(text, uuid) to anon, authenticated;
