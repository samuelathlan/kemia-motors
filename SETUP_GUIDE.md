# Guide de démarrage Kemia Motors

## Phase 1 — Fondations (✅ En cours)

La base du projet est prête. Voici ce qui a été créé :

### Structure du projet
- ✅ Next.js 14 + TypeScript + Tailwind CSS
- ✅ Système AI pluggable avec Gemini (gratuit)
- ✅ Schéma Supabase complet (migrations.sql)
- ✅ Types TypeScript pour toutes les tables
- ✅ Branding Kemia Motors (couleurs, styles)

### Fichiers clés
- `migrations.sql` — Schéma Supabase avec RLS
- `seed.sql` — Données de démo (3 membres, sorties, lieux)
- `lib/ai/client.ts` — API IA centralisée (remplacer Gemini si besoin)
- `.env.local` — Variables d'environnement

---

## Étapes de configuration (À faire maintenant)

### 1️⃣ Supabase — Créer le projet et les tables

```bash
# 1. Aller sur https://supabase.com et créer un nouveau projet
# 2. Attendre que le projet soit prêt (~2 min)
# 3. Aller dans "Settings > API" et copier :
#    - Project URL
#    - anon key
#    - service_role key (dans l'onglet "Service Role")

# 4. Remplir .env.local :
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
GOOGLE_API_KEY=AIzaSyxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_PROVIDER=gemini
EOF

# 5. Dans la console Supabase :
#    - Aller dans "SQL Editor"
#    - Créer une nouvelle query
#    - Copier tout le contenu de migrations.sql
#    - Exécuter (▶️ Play button)

# 6. Dans "Storage" > "New bucket" :
#    - Créer "avatars"
#    - Créer "motorcycle-photos"
```

### 2️⃣ Google Gemini API — Clé gratuite

```bash
# 1. Aller sur https://console.cloud.google.com
# 2. Créer un nouveau projet (bouton "New Project" en haut)
# 3. Aller dans "APIs & Services" > "Library"
# 4. Chercher "Generative Language API" et cliquer dessus
# 5. Cliquer "Enable"
# 6. Aller dans "APIs & Services" > "Credentials"
# 7. Cliquer "Create Credentials" > "API Key"
# 8. Copier la clé et la coller dans .env.local (GOOGLE_API_KEY=...)
```

### 3️⃣ Tester le démarrage

```bash
npm run dev
```

Puis ouvrir `http://localhost:3000` — vous devez voir le logo Kemia Motors et les boutons "Connexion" et "Vous êtes invité ?"

---

## Prochaines étapes (Phase 1 complète)

Une fois Supabase et Gemini configurés, on construit :

1. **Auth** — Pages de connexion/inscription via Supabase
2. **Dashboard** — Vue perso avec stats et carte
3. **Charte du club** — Liste des articles avec acceptation
4. **Sorties** — CRUD des sorties et liste
5. **Carte du club** — Vue globale Leaflet
6. **Fiches motos** — Upload et gestion des motos
7. **Gestion des membres** — Admin : générer invites, gérer rôles

---

## Trucs importants

- 🔒 **Jamais** commit `.env.local` ou `.env*` — git les ignore automatiquement
- 🚀 Tester les changements localement avant de pousser
- 📱 Mobile-first : tester sur petit écran régulièrement
- 🔑 Garder les clés API sécurisées (pas de partage, rotation régulière)

---

## Support

Si vous êtes bloqué :
1. Vérifier les variables d'env (copier-coller depuis Supabase/Google Cloud)
2. Vérifier que les buckets Storage existent et sont bien nommés
3. Regarder les logs Supabase dans la console (Tables > Logs en bas)

---

**Objectif** : avoir une app fonctionnelle et testable avec les 3 membres + quelques sorties de démo dans les 2-3 jours.
