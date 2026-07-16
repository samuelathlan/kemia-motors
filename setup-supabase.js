#!/usr/bin/env node

/**
 * Setup Supabase - Exécute les migrations et crée les buckets Storage
 * Utilisation: node setup-supabase.js
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Charger les env vars
require('dotenv').config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erreur : variables d\'environnement manquantes')
  console.error('Ajoute NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function executeMigrations() {
  console.log('\n🚀 Démarrage de la configuration Supabase...\n')

  try {
    // Lire le fichier migrations.sql
    const migrationsPath = path.join(__dirname, 'migrations.sql')
    const migrations = fs.readFileSync(migrationsPath, 'utf-8')

    console.log('📋 Exécution des migrations SQL...')

    // Exécuter les migrations
    const { error: migrationError } = await supabase.rpc('exec', {
      sql: migrations,
    }).catch(() => {
      // Si exec() n'existe pas, on essaie une approche alternative
      return executeRawSQL(supabase, migrations)
    })

    if (migrationError && migrationError.message !== 'function exec(text) does not exist') {
      throw migrationError
    }

    console.log('✅ Migrations SQL exécutées\n')

    // Créer les buckets Storage
    console.log('🪣 Création des buckets Storage...')

    const buckets = ['avatars', 'motorcycle-photos']

    for (const bucketName of buckets) {
      try {
        // Vérifier si le bucket existe déjà
        const { data: existing } = await supabase.storage.getBucket(bucketName)

        if (existing) {
          console.log(`  ✅ Bucket "${bucketName}" existe déjà`)
          continue
        }
      } catch (e) {
        // Le bucket n'existe pas, on le crée
      }

      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      })

      if (bucketError && !bucketError.message.includes('already exists')) {
        throw bucketError
      }

      console.log(`  ✅ Bucket "${bucketName}" créé/validé`)
    }

    console.log('\n✨ Configuration Supabase terminée avec succès !\n')
    console.log('Prochaines étapes :')
    console.log('  1. Ajouter GOOGLE_API_KEY dans .env.local')
    console.log('  2. Lancer : npm run dev')
    console.log('  3. Ouvrir : http://localhost:3000\n')

  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration :\n', error.message)
    console.error('\n💡 Solution alternative :')
    console.error('  1. Aller sur https://supabase.com > ton projet Kemia')
    console.error('  2. SQL Editor > New Query')
    console.error('  3. Copier le contenu de migrations.sql')
    console.error('  4. Exécuter la query')
    process.exit(1)
  }
}

async function executeRawSQL(supabase, sql) {
  // Approche alternative : exécuter directement via l'API
  // Cela nécessite que pgrest soit disponible
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { error }
    }

    return { data: await response.json() }
  } catch (error) {
    return { error }
  }
}

// Exécuter
executeMigrations()
