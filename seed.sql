-- Kemia Motors - Seed data for development

-- Seed data (you'll need to replace the UUIDs with real user IDs from auth after creating them)
-- This is example data to demonstrate the schema

-- Members (these UUIDs are placeholders - replace with real auth.users IDs)
insert into members (id, pseudo, nom_affiche, role, statut, date_inscription, date_acceptation_charte)
values
  ('00000000-0000-0000-0000-000000000001', 'captain_max', 'Max', 'super_admin', 'membre_actif', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'alex_rider', 'Alex', 'membre', 'membre_actif', now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'sunny_roads', 'Sam', 'membre', 'membre_actif', now(), now())
on conflict do nothing;

-- Charter articles
insert into club_charter (titre_article, texte_complet, ordre_affichage, version)
values
  (
    'Esprit du Club',
    'Kemia Motors, c''est l''esprit de partage et l''amour de la route. Nous roulons ensemble pour découvrir, apprendre et créer des souvenirs durables.',
    1,
    1
  ),
  (
    'Sécurité',
    'La sécurité est notre priorité absolue. Chaque sortie doit être planifiée, et chaque pilote doit être responsable de son équipement et de son comportement sur la route.',
    2,
    1
  ),
  (
    'Respect et Inclusivité',
    'Nous respectons chaque membre, indépendamment de l''expérience ou du type de moto. Aucune discrimination, aucun jugement. Nous sommes une famille.',
    3,
    1
  ),
  (
    'Engagement sur les Sorties',
    'Si tu dis oui, tu viens. Si tu ne peux pas, tu préviens au minimum 48h avant. Le respect des autres, c''est aussi ça.',
    4,
    1
  )
on conflict do nothing;

-- Motorcycles
insert into motorcycles (member_id, marque, modele, annee, kilometrage_total, surnom)
values
  ('00000000-0000-0000-0000-000000000001', 'Honda', 'CB1000R', 2020, 45000, 'Le Monstre Noir'),
  ('00000000-0000-0000-0000-000000000002', 'Triumph', 'Street Twin', 2019, 32000, 'Le Brit'''),
  ('00000000-0000-0000-0000-000000000003', 'Yamaha', 'MT-09', 2021, 28000, 'La Bête Bleue')
on conflict do nothing;

-- Sample outing
insert into outings (titre, description, date_debut, date_fin, type, cree_par)
values
  (
    'Roadtrip Alpes du Sud',
    'Une magnifique échappée dans les Alpes du Sud avec arrêts gourmands et panoramas époustouflants',
    '2024-08-15 07:00:00',
    '2024-08-17 18:00:00',
    'roadtrip_multi_jours',
    '00000000-0000-0000-0000-000000000001'
  )
on conflict do nothing;

-- Sample visited places
insert into visited_places (nom, description, latitude, longitude, date_visite, type_lieu, pays, region, lien_google_maps)
values
  (
    'Col de la Bonette',
    'Le plus haut col routier des Alpes, à 2715m. Descente spectaculaire.',
    44.0667,
    6.8333,
    '2024-08-15',
    'nature',
    'France',
    'Provence-Alpes-Côte d''Azur',
    'https://maps.google.com/?q=Col+de+la+Bonette'
  ),
  (
    'Refuge Napoléon',
    'Petit refuge de montagne avec vue panoramique incroyable. Accueil chaleureux et bonne nourriture.',
    44.0500,
    6.8500,
    '2024-08-16',
    'culinaire',
    'France',
    'Provence-Alpes-Côte d''Azur',
    'https://maps.google.com/?q=Refuge+Napoleon+Alpes'
  )
on conflict do nothing;
