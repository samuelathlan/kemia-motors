-- =====================================================================
-- Admin write policies
-- Adds INSERT/UPDATE/DELETE (FOR ALL) policies so that members with role
-- 'admin' or 'super_admin' can manage all content. Until now only SELECT
-- policies existed, so every admin create/edit/delete was blocked by RLS.
-- Safe to run multiple times (drops policies first).
-- =====================================================================

-- Helper: is the current user an admin?
-- SECURITY DEFINER so it can read members regardless of the caller's RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from members
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

-- Helper: is the current user a super_admin?
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from members
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

-- ---------- Outings ----------
drop policy if exists "Admins can manage outings" on outings;
create policy "Admins can manage outings" on outings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Outing participants ----------
drop policy if exists "Admins can manage participants" on outing_participants;
create policy "Admins can manage participants" on outing_participants
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Outing RSVPs ----------
drop policy if exists "Admins can manage rsvps" on outing_rsvps;
create policy "Admins can manage rsvps" on outing_rsvps
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Outing days ----------
drop policy if exists "Admins can manage outing days" on outing_days;
create policy "Admins can manage outing days" on outing_days
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Visited places ----------
drop policy if exists "Admins can manage places" on visited_places;
create policy "Admins can manage places" on visited_places
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Anecdotes ----------
drop policy if exists "Admins can manage anecdotes" on anecdotes;
create policy "Admins can manage anecdotes" on anecdotes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- GPX tracks ----------
drop policy if exists "Admins can manage tracks" on gpx_tracks;
create policy "Admins can manage tracks" on gpx_tracks
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Media links ----------
drop policy if exists "Admins can manage media" on media_links;
create policy "Admins can manage media" on media_links
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Club charter ----------
drop policy if exists "Admins can manage charter" on club_charter;
create policy "Admins can manage charter" on club_charter
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Members (super_admin manages roles / statuses of anyone) ----------
drop policy if exists "Super admins can manage members" on members;
create policy "Super admins can manage members" on members
  for all using (public.is_super_admin()) with check (public.is_super_admin());
