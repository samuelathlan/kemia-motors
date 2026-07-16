# Déployer Kemia Motors en Production

Vous avez testé V1 en local ? Excellent ! Voici comment déployer sur Vercel + Supabase.

---

## Phase 1 : Préparer GitHub

### 1. Créer un repo GitHub (privé ou public)

```bash
git remote add origin https://github.com/VOTRE_USERNAME/kemia-motors.git
git branch -M main
git push -u origin main
```

### 2. Vérifier le `.gitignore`

```bash
# Vérifier que ces fichiers sont ignorés :
cat .gitignore | grep env
# Doit contenir : .env.local, .env*.local
```

**Jamais committer :**
- `.env.local` (clés privées)
- `node_modules/`
- `.next/`

---

## Phase 2 : Déployer le Frontend sur Vercel

### 1. Créer un compte Vercel

Aller sur [vercel.com](https://vercel.com) et s'inscrire avec GitHub.

### 2. Importer le repo

1. Cliquer **"New Project"**
2. Chercher `kemia-motors` et cliquer
3. Vercel détecte Next.js automatiquement

### 3. Ajouter les variables d'environnement

Avant de cliquer "Deploy", aller dans **"Environment Variables"** et ajouter :

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...
SUPABASE_SERVICE_ROLE_KEY       = eyJ...
GOOGLE_API_KEY                  = AIzaSy...
NEXT_PUBLIC_APP_URL             = https://kemia-motors-xyz.vercel.app
```

⚠️ **IMPORTANT** : `NEXT_PUBLIC_*` sont exposés au navigateur, donc pas de secrets dedans.

### 4. Déployer

Cliquer **"Deploy"** → Vercel va builder et déployer automatiquement.

Attendre ~2 min → vous aurez une URL comme `https://kemia-motors-xyz.vercel.app`

---

## Phase 3 : Configurer OAuth Redirect

Google OAuth doit connaître votre URL de production.

### Dans Google Cloud Console

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. Chercher votre projet Gemini (il y a un autre OAuth qu'on peut aussi configurer si utilisé)
3. **APIs & Services > Credentials > OAuth 2.0 Client IDs**
4. Ajouter Authorized redirect URIs :
   - `https://votre-domaine.vercel.app/auth/callback`

### Dans Supabase

1. Aller sur [supabase.com](https://supabase.com) > votre projet
2. **Authentication > Providers > Google**
3. Ajouter Authorized Redirect URLs :
   - `https://votre-domaine.vercel.app/auth/callback`

---

## Phase 4 : Tester en Production

### 1. Ouvrir votre app

`https://kemia-motors-xyz.vercel.app`

### 2. Tester le flux complet

- Créer un compte (avec code d'invite)
- Accepter la charte
- Voir les sorties et la carte
- Si vous avez ajouté les données de démo, elles devraient s'afficher

### 3. Vérifier les logs

Vercel > Deployments > Logs si vous voyez des erreurs.

---

## Phase 5 : Ajouter un domaine personnalisé (optionnel)

Si vous voulez `kemia-motors.fr` au lieu de `vercel.app` :

1. Aller dans Vercel > Settings > Domains
2. Ajouter votre domaine
3. Configurer les DNS chez votre registrar (namecheap, gandi, etc.)
4. Attendre la propagation DNS (~30 min à quelques heures)

---

## Automatisation avec Vercel

### Déploiements automatiques

- Chaque `git push` vers `main` déclenche un déploiement auto
- Vous pouvez aussi créer des preview deployments pour les branches

### Variables d'env

- Créées une seule fois dans Vercel
- Utilisées pour tous les déploiements
- Pas besoin de les re-copier à chaque fois

---

## Maintenance après déploiement

### Mises à jour du code

```bash
# Faire vos changements localement
git commit -m "..."
git push origin main

# Vercel auto-déploie 🚀
```

### Mises à jour du schéma Supabase

```bash
# Dans Supabase SQL Editor
# Écrire et exécuter les migrations

# Aucun impact sur les données existantes
```

### Monitoring

- **Supabase** : Database > Logs pour les requêtes SQL
- **Vercel** : Deployments > Logs pour les erreurs Next.js
- **Google Cloud** : Monitoring pour l'API Gemini

---

## Checklist avant d'aller en prod

- ✅ Supabase projet créé et tables migrées
- ✅ Google Gemini API key créée
- ✅ Repo GitHub avec `.gitignore` correct
- ✅ Variables Vercel configurées
- ✅ OAuth redirects ajoutés (Google + Supabase)
- ✅ Testé en local (login, charte, sorties, motos)
- ✅ Déploiement Vercel réussi

---

## Prochaines étapes (V2)

Une fois V1 stable en production, construire :

- 🚀 Itinéraire jour par jour + résumé IA
- 📊 Timeline et statistiques  
- 🗺️ Cartes pays/régions
- 📤 Import GPX/KML
- 🔍 Recherche
- 📄 Export PDF

---

## Support

Problèmes courants :

| Problème | Solution |
|----------|----------|
| "Invalid redirect URI" | Vérifier les URLs dans Google/Supabase |
| 500 error lors du login | Vérifier les env vars dans Vercel |
| Les motos n'affichent pas | Vérifier les buckets Storage Supabase |
| Page blanche | Regarder les logs Vercel (Deployments > Logs) |

---

**Objectif** : V1 en prod en 1-2 jours, prête pour les vrais tests en sortie moto ! 🏍️
