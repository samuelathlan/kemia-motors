-- Add NOT NULL constraints on critical fields
ALTER TABLE outings
  ALTER COLUMN titre SET NOT NULL,
  ALTER COLUMN description SET NOT NULL,
  ALTER COLUMN date_debut SET NOT NULL;

ALTER TABLE visited_places
  ALTER COLUMN nom SET NOT NULL,
  ALTER COLUMN date_visite SET NOT NULL,
  ALTER COLUMN latitude SET NOT NULL,
  ALTER COLUMN longitude SET NOT NULL;

ALTER TABLE outing_days
  ALTER COLUMN outing_id SET NOT NULL,
  ALTER COLUMN date SET NOT NULL,
  ALTER COLUMN numero_jour SET NOT NULL;

-- Add UNIQUE constraint on charter_acceptances to prevent duplicates
ALTER TABLE charter_acceptances
  ADD CONSTRAINT unique_charter_acceptance_per_member_article
  UNIQUE (member_id, article_id);

-- Add missing indexes on foreign keys
CREATE INDEX idx_anecdotes_member_id ON anecdotes(member_id);
CREATE INDEX idx_anecdotes_outing_day_id ON anecdotes(outing_day_id);
CREATE INDEX idx_media_links_member_id ON media_links(member_id);
CREATE INDEX idx_media_links_outing_id ON media_links(outing_id);
CREATE INDEX idx_outing_days_outing_id ON outing_days(outing_id);
CREATE INDEX idx_outing_participants_member_id ON outing_participants(member_id);
CREATE INDEX idx_gpx_tracks_outing_id ON gpx_tracks(outing_id);

-- Add DEFAULT timestamp on charter_acceptances
ALTER TABLE charter_acceptances
  ALTER COLUMN accepted_at SET DEFAULT NOW();
