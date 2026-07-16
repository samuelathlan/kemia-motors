# Quick Start - Kemia Motors

## V1 est prête ! 🎉

L'application V1 avec tous les features principaux est construite et prête à être testée en local.

### Qu'est-ce qui est inclus dans V1

- ✅ **Auth** — Login (email/Google), signup avec invite, middleware de protection
- ✅ **Charte du Club** — Articles versionnés, acceptation obligatoire, blocage d'accès
- ✅ **Dashboard** — Vue personnelle avec navigation
- ✅ **Sorties** — Liste des sorties, détail avec RSVP (oui/non/peut-être)
- ✅ **Carte du Club** — Vue globale des lieux + traces GPX
- ✅ **Motos** — Liste des motos avec galerie de photos, upload Supabase Storage
- ✅ **Admin** — Générer liens d'invitation, voir tous les membres

---

## 1️⃣ Configuration Supabase (10 min)

### Créer le projet

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet (nom : `kemia-motors`)
3. Attendre ~2 minutes que le projet soit prêt
4. Aller dans **Settings > API**

### Copier les clés

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Créer les tables

1. Dans **SQL Editor**, créer une nouvelle query
2. Copier le contenu complet de `migrations.sql`
3. Cliquer le bouton **Run** (▶️ en haut)
4. Attendre que tout s'exécute (vert)

### Créer les buckets Storage

1. Aller dans **Storage > New bucket**
2. Créer `avatars` (public)
3. Créer `motorcycle-photos` (public)

---

## 2️⃣ Configuration Google Gemini (5 min)

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. **Créer un nouveau projet** (coincliquant haut)
3. Attendre et entrer dans le projet
4. Aller dans **APIs & Services > Library**
5. Chercher `Generative Language API` et cliquer
6. Cliquer **Enable**
7. Aller dans **APIs & Services > Credentials**
8. Cliquer **Create Credentials > API Key**
9. Copier la clé

---

## 3️⃣ Remplir `.env.local`

```bash
# À la racine du projet, remplir ce fichier :
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_API_KEY=AIzaSy...
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_PROVIDER=gemini
```

Chaque clé est marquée en commentaire dans le `.env.local` existant.

---

## 4️⃣ Lancer en local

```bash
npm run dev
```

Aller sur `http://localhost:3000`

---

## 5️⃣ Tester le flux complet

### Création de compte

1. Cliquer **"Vous êtes invité ?"**
2. Ajouter un code d'invitation temporaire (n'importe quel code pour tester, ex: `test123`)
3. Remplir le formulaire de signup
4. Accepter tous les articles de la charte
5. Cliquer **"Confirmer mon acceptation"**
6. Accès au dashboard ✅

### Parcourir l'app

- **Dashboard** → stats et navigation
- **Sorties** → liste et détail avec RSVP
- **Carte** → vue globale (sera vide sans données de démo)
- **Motos** → liste des motos (sera vide sans données)
- **Charte** → voir les articles acceptés

---

## 6️⃣ Ajouter les données de démo (optionnel)

Dans Supabase **SQL Editor**, exécuter `seed.sql` pour ajouter :
- 3 membres (Max, Alex, Sam)
- 3 motos
- 1 roadtrip d'exemple
- 2 lieux visités

---

## Architecture

### Pages principales

```
/                       → Accueil
/auth/login            → Connexion
/auth/signup           → Inscription (avec code invite)
/charter               → Charte du club (acceptation requise)
/dashboard             → Tableau de bord personnel
/outings               → Liste des sorties
/outings/[id]          → Détail sortie + RSVP
/map                   → Carte du club
/motorcycles           → Motos du club
/admin/members         → Gestion des membres (admin only)
```

### Base de données

- **Members** — Utilisateurs (super_admin, admin, membre)
- **Motorcycles** — Motos avec photos
- **Outings** — Sorties/roadtrips
- **VisitedPlaces** — Lieux géolocalisés
- **ClubCharter** — Articles (versionnés)
- **CharterAcceptances** — Qui a accepté quoi
- **OutingRSVPs** — Statut "je viens"

Toutes les tables ont **Row Level Security (RLS)** activée.

---

## Prochaines étapes (V2)

- 🚀 Itinéraire jour par jour + résumé IA (Claude/Gemini)
- 📊 Timeline et statistiques
- 🗺️ Cartes des pays/régions visités
- 📤 Import GPX/KML
- 🔍 Recherche transverse
- 📄 Export PDF carnet de voyage

---

## Points importants

⚠️ **Ne pas committer `.env.local`** — il est dans `.gitignore`

⚠️ **Clés API sécurisées** :
- `.env.local` en local
- Variables Vercel en production

⚠️ **RLS protège les données** — un membre invité ne peut voir que la charte
- Un membre retiré perd l'accès mais son historique reste visible

---

## Support

Si vous êtes bloqué :
1. Vérifier que toutes les tables Supabase sont créées (SQL Editor > Logs en bas)
2. Vérifier que les buckets Storage existent
3. Vérifier les variables d'env (copy-paste exact depuis Supabase/Google Cloud)
4. Regarder la console du navigateur (F12 > Console) pour les erreurs

---

**Slogan du club** : Ride & Share 🏍️
