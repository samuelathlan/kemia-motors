-- KEMIA MOTORS - TEST USER SETUP
-- Run this in Supabase SQL Editor

-- ===== ADMIN USER =====
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@kemia.test',
  crypt('Test123!@#', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  true,
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO members (id, pseudo, nom_affiche, role, statut, date_acceptation_charte, date_inscription)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin_cpto',
  'CPTO Samuel',
  'super_admin',
  'membre_actif',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ===== MEMBER USER =====
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'member@kemia.test',
  crypt('Test123!@#', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO members (id, pseudo, nom_affiche, role, statut, date_acceptation_charte, date_inscription)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'member_test',
  'Test Member',
  'membre',
  'membre_actif',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ===== DEMO DATA =====
-- Charter Articles
INSERT INTO club_charter (titre_article, texte_complet, ordre_affichage, version)
VALUES
  ('Esprit du Club', 'Kemia Motors, c''est l''esprit de partage et l''amour de la route.', 1, 1),
  ('Sécurité', 'La sécurité est notre priorité absolue.', 2, 1),
  ('Respect', 'Nous respectons chaque membre et leur passion.', 3, 1)
ON CONFLICT DO NOTHING;

-- Mark charter as accepted
INSERT INTO charter_acceptances (article_id, member_id, version_acceptee, accepted_at)
SELECT ca.id, m.id, 1, NOW()
FROM club_charter ca
CROSS JOIN members m
WHERE m.statut = 'membre_actif'
ON CONFLICT (article_id, member_id) DO NOTHING;

-- Motorcycles
INSERT INTO motorcycles (member_id, marque, modele, annee, kilometrage_total, surnom)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Harley-Davidson', 'Iron 883', 2022, 5400, 'The Beast'),
  ('00000000-0000-0000-0000-000000000002', 'Kawasaki', 'Ninja 400', 2023, 2100, 'Green Machine')
ON CONFLICT DO NOTHING;

-- Outings (Sorties)
INSERT INTO outings (titre, description, date_debut, date_fin, type, cree_par)
VALUES
  ('Weekend Route des Alpes', 'Une belle sortie dans les Alpes suisses', '2026-07-25 09:00:00', '2026-07-25 18:00:00', 'sortie_simple', '00000000-0000-0000-0000-000000000001'),
  ('Roadtrip Côte d''Azur', 'Une longue balade le long de la Méditerranée', '2026-08-01 08:00:00', '2026-08-03 18:00:00', 'roadtrip_multi_jours', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Outing Participants
INSERT INTO outing_participants (outing_id, member_id)
SELECT o.id, m.id
FROM outings o
CROSS JOIN members m
WHERE m.statut = 'membre_actif'
ON CONFLICT (outing_id, member_id) DO NOTHING;

-- Outing RSVPs
INSERT INTO outing_rsvps (outing_id, member_id, statut)
SELECT o.id, m.id, 'oui'
FROM outings o
CROSS JOIN members m
WHERE m.statut = 'membre_actif'
ON CONFLICT (outing_id, member_id) DO NOTHING;

SELECT '✅ Test data created successfully' as status;
