# Kemia Motors - Ride & Share

Application web pour le club moto Kemia Motors. Gestion des sorties, des motos, de la charte du club, et des lieux visités.

## Stack technique

- **Frontend** : Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend / DB / Auth** : Supabase (Postgres + Auth)
- **Carte** : Leaflet + OpenStreetMap via `react-leaflet`
- **IA pour résumés** : Google Gemini API (gratuit)
- **Hébergement** : Vercel (frontend) + Supabase (backend)

## Configuration initiale

### 1. Cloner le repo et installer les dépendances

```bash
cd kemia-motors
npm install
```

### 2. Configurer Supabase

1. Créer un nouveau projet sur [supabase.com](https://supabase.com)
2. Récupérer :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (depuis les paramètres du projet)
3. Remplir le fichier `.env.local` avec ces clés
4. Dans la console Supabase :
   - Aller dans l'éditeur SQL
   - Copier-coller le contenu de `migrations.sql`
   - Exécuter le script pour créer les tables et les politiques RLS

### 3. Configurer Google Gemini API

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créer un nouveau projet
3. Activer l'API "Generative Language API"
4. Créer une clé API (type : "API key")
5. Ajouter la clé dans `.env.local` : `GOOGLE_API_KEY=...`

### 4. Configurer les buckets Supabase Storage

Dans la console Supabase, créer deux buckets Storage :
- `avatars` — pour les photos de profil
- `motorcycle-photos` — pour les photos de motos

## Développement local

```bash
npm run dev
```

L'app est disponible à `http://localhost:3000`

## Déploiement sur Vercel

1. Pousser le code sur GitHub
2. Connecter le repo à [vercel.com](https://vercel.com)
3. Ajouter les variables d'environnement
4. Déployer

---

**Slogan du club** : Ride & Share 🏍️
