-- Kemia Motors - Schema Supabase

-- Enable extensions
create extension if not exists "uuid-ossp";
-- pgvector disabled (for V2+ semantic search)

-- Create ENUM types
create type member_role as enum ('membre', 'admin', 'super_admin');
create type member_status as enum ('invité', 'en_attente_acceptation_charte', 'membre_actif', 'retiré');
create type outing_type as enum ('sortie_simple', 'roadtrip_multi_jours');
create type venue_type as enum ('historique', 'culinaire', 'nature', 'autre');
create type platform as enum ('instagram', 'google_drive', 'other');
create type rsvp_status as enum ('oui', 'non', 'peut_etre');
create type hebergement_plateforme as enum ('booking', 'airbnb', 'autre');

-- Members table (extends auth.users)
create table if not exists members (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo varchar(255) not null unique,
  nom_affiche varchar(255) not null,
  avatar_storage_path varchar(500),
  date_inscription timestamp default now(),
  role member_role default 'membre',
  statut member_status default 'invité',
  date_acceptation_charte timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Emergency info (visible only to members, not public)
create table if not exists member_emergency_info (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references members(id) on delete cascade unique,
  contact_urgence_nom varchar(255),
  contact_urgence_telephone varchar(255),
  info_assurance text,
  lien_tribusante varchar(500),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Motorcycles
create table if not exists motorcycles (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references members(id) on delete cascade,
  marque varchar(255) not null,
  modele varchar(255) not null,
  annee int not null,
  kilometrage_total int default 0,
  surnom varchar(255),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Motorcycle photos
create table if not exists motorcycle_photos (
  id uuid primary key default uuid_generate_v4(),
  motorcycle_id uuid not null references motorcycles(id) on delete cascade,
  storage_path varchar(500) not null,
  uploaded_at timestamp default now()
);

-- Club Charter
create table if not exists club_charter (
  id uuid primary key default uuid_generate_v4(),
  titre_article varchar(500) not null,
  texte_complet text not null,
  ordre_affichage int not null,
  version int default 1,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Charter acceptances
create table if not exists charter_acceptances (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid not null references club_charter(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  version_acceptee int,
  accepted_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(article_id, member_id)
);

-- Outings
create table if not exists outings (
  id uuid primary key default uuid_generate_v4(),
  titre varchar(500) not null,
  description text,
  date_debut timestamp not null,
  date_fin timestamp not null,
  type outing_type default 'sortie_simple',
  cree_par uuid not null references members(id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Outing participants
create table if not exists outing_participants (
  id uuid primary key default uuid_generate_v4(),
  outing_id uuid not null references outings(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamp default now(),
  unique(outing_id, member_id)
);

-- Outing RSVPs
create table if not exists outing_rsvps (
  id uuid primary key default uuid_generate_v4(),
  outing_id uuid not null references outings(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  statut rsvp_status default 'peut_etre',
  updated_at timestamp default now(),
  unique(outing_id, member_id)
);

-- Outing days (for multi-day outings)
create table if not exists outing_days (
  id uuid primary key default uuid_generate_v4(),
  outing_id uuid not null references outings(id) on delete cascade,
  date timestamp not null,
  numero_jour int not null,
  titre_du_jour varchar(500),
  hebergement_nom varchar(500),
  hebergement_url varchar(500),
  hebergement_plateforme hebergement_plateforme,
  notes_du_jour text,
  resume_ia text,
  resume_genere_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Visited places (créée avant anecdotes pour les foreign keys)
create table if not exists visited_places (
  id uuid primary key default uuid_generate_v4(),
  outing_id uuid references outings(id) on delete set null,
  outing_day_id uuid references outing_days(id) on delete set null,
  nom varchar(500) not null,
  description text,
  latitude numeric(10,8) not null,
  longitude numeric(11,8) not null,
  date_visite timestamp,
  type_lieu venue_type default 'autre',
  pays varchar(255) not null,
  region varchar(255),
  lien_google_maps varchar(500),
  lien_instagram varchar(500),
  lien_google_drive varchar(500),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Anecdotes
create table if not exists anecdotes (
  id uuid primary key default uuid_generate_v4(),
  outing_day_id uuid references outing_days(id) on delete cascade,
  visited_place_id uuid references visited_places(id) on delete cascade,
  member_id uuid not null references members(id),
  texte text not null,
  photo_storage_path varchar(500),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- GPX Tracks
create table if not exists gpx_tracks (
  id uuid primary key default uuid_generate_v4(),
  outing_id uuid references outings(id) on delete set null,
  member_id uuid not null references members(id),
  fichier_gpx_url varchar(500),
  lien_calimoto varchar(500),
  distance_km numeric(10,2),
  duree varchar(50),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Media links
create table if not exists media_links (
  id uuid primary key default uuid_generate_v4(),
  outing_id uuid references outings(id) on delete cascade,
  visited_place_id uuid references visited_places(id) on delete cascade,
  member_id uuid not null references members(id),
  url varchar(500) not null,
  plateforme platform default 'other',
  legende text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Indexes for performance
create index idx_members_role on members(role);
create index idx_members_statut on members(statut);
create index idx_motorcycles_member_id on motorcycles(member_id);
create index idx_outings_cree_par on outings(cree_par);
create index idx_outings_date_debut on outings(date_debut);
create index idx_visited_places_outing_id on visited_places(outing_id);
create index idx_visited_places_coords on visited_places(latitude, longitude);
create index idx_charter_ordre on club_charter(ordre_affichage);

-- Enable RLS
alter table members enable row level security;
alter table member_emergency_info enable row level security;
alter table motorcycles enable row level security;
alter table motorcycle_photos enable row level security;
alter table club_charter enable row level security;
alter table charter_acceptances enable row level security;
alter table outings enable row level security;
alter table outing_participants enable row level security;
alter table outing_rsvps enable row level security;
alter table outing_days enable row level security;
alter table anecdotes enable row level security;
alter table gpx_tracks enable row level security;
alter table visited_places enable row level security;
alter table media_links enable row level security;

-- RLS Policies

-- Members: everyone can read, only super_admin can manage
create policy "Members can read members" on members for select using (true);
create policy "Members can update own profile" on members for update using (auth.uid() = id);

-- Emergency info: only other active members can read, not public
create policy "Active members can read emergency info" on member_emergency_info
  for select using (
    exists(
      select 1 from members m
      where m.id = auth.uid()
      and m.statut = 'membre_actif'
      and m.id != member_emergency_info.member_id
    )
  );

-- Motorcycles: everyone can read
create policy "Members can read motorcycles" on motorcycles for select using (true);
create policy "Owner can insert/update motorcycle" on motorcycles
  for all using (member_id = auth.uid())
  with check (member_id = auth.uid());

-- Club charter: everyone can read
create policy "Everyone can read charter" on club_charter for select using (true);

-- Charter acceptances: everyone can read, members can update own
create policy "Everyone can read acceptances" on charter_acceptances for select using (true);
create policy "Member can accept articles" on charter_acceptances for insert
  with check (member_id = auth.uid());
create policy "Member can update own acceptances" on charter_acceptances for update
  using (member_id = auth.uid());

-- Outings: active members can read
create policy "Active members can read outings" on outings for select using (
  exists(
    select 1 from members m
    where m.id = auth.uid() and m.statut = 'membre_actif'
  )
);

-- Visited places: active members can read
create policy "Active members can read places" on visited_places for select using (
  exists(
    select 1 from members m
    where m.id = auth.uid() and m.statut = 'membre_actif'
  )
);

-- GPX tracks: active members can read
create policy "Active members can read tracks" on gpx_tracks for select using (
  exists(
    select 1 from members m
    where m.id = auth.uid() and m.statut = 'membre_actif'
  )
);

-- Anecdotes: active members can read, creator can modify
create policy "Active members can read anecdotes" on anecdotes for select using (
  exists(
    select 1 from members m
    where m.id = auth.uid() and m.statut = 'membre_actif'
  )
);
create policy "Creator can manage anecdotes" on anecdotes for all using (member_id = auth.uid());
