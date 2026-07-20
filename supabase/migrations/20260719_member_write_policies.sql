-- =====================================================================
-- Member write policies for day-by-day trip content
-- Active members (not just admins) can add their own GPX tracks,
-- Instagram links, and day notes — matching the existing pattern for
-- motorcycles and anecdotes (each member manages their own content).
-- Admins retain full control via existing "Admins can manage ..." policies.
-- =====================================================================

-- GPX tracks: any active member can add their own track
drop policy if exists "Members can add own tracks" on gpx_tracks;
create policy "Members can add own tracks" on gpx_tracks
  for insert with check (member_id = auth.uid() and public.is_active_member());

drop policy if exists "Members can delete own tracks" on gpx_tracks;
create policy "Members can delete own tracks" on gpx_tracks
  for delete using (member_id = auth.uid());

-- Media links (Instagram etc.): any active member can add/delete their own
drop policy if exists "Members can add own media" on media_links;
create policy "Members can add own media" on media_links
  for insert with check (member_id = auth.uid() and public.is_active_member());

drop policy if exists "Members can delete own media" on media_links;
create policy "Members can delete own media" on media_links
  for delete using (member_id = auth.uid());

-- Outing days: any active member can edit the notes of a day (collaborative log)
drop policy if exists "Members can update day notes" on outing_days;
create policy "Members can update day notes" on outing_days
  for update using (public.is_active_member()) with check (public.is_active_member());
