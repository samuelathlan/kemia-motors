-- =====================================================================
-- Member read policies
-- Active members can READ day-by-day content (days, participants, media),
-- and manage their OWN RSVP. Admin-only ALL policies already exist.
-- =====================================================================

-- Helper: is the current user an active member?
create or replace function public.is_active_member()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from members
    where id = auth.uid() and statut = 'membre_actif'
  );
$$;

-- Outing days
drop policy if exists "Active members can read days" on outing_days;
create policy "Active members can read days" on outing_days
  for select using (public.is_active_member());

-- Participants
drop policy if exists "Active members can read participants" on outing_participants;
create policy "Active members can read participants" on outing_participants
  for select using (public.is_active_member());

-- Media links
drop policy if exists "Active members can read media" on media_links;
create policy "Active members can read media" on media_links
  for select using (public.is_active_member());

-- RSVPs: members read all, manage their own
drop policy if exists "Active members can read rsvps" on outing_rsvps;
create policy "Active members can read rsvps" on outing_rsvps
  for select using (public.is_active_member());

drop policy if exists "Members manage own rsvp" on outing_rsvps;
create policy "Members manage own rsvp" on outing_rsvps
  for all using (member_id = auth.uid()) with check (member_id = auth.uid());
