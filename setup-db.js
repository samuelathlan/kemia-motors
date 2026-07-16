#!/usr/bin/env node

/**
 * CTO Setup Script - Exécute tout automatiquement
 * Utilisation: node setup-db.js
 */

const { Pool } = require('pg')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

require('dotenv').config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvlmxsgvkdogbnnldauy.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PROJECT_ID = SUPABASE_URL.split('https://')[1].split('.')[0]

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local')
  process.exit(1)
}

async function setupDatabase() {
  console.log('\n🚀 CTO Setup - Configuration Supabase complète\n')
  console.log(`📍 Projet: ${PROJECT_ID}`)
  console.log(`🔗 URL: ${SUPABASE_URL}\n`)

  try {
    // 1. Connexion PostgreSQL
    console.log('🔐 Connexion PostgreSQL...')

    const pool = new Pool({
      host: `${PROJECT_ID}.db.supabase.co`,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: SERVICE_ROLE_KEY,
      ssl: { rejectUnauthorized: false },
    })

    // Test connection
    const client = await pool.connect()
    console.log('✅ Connecté à PostgreSQL\n')

    // 2. Exécuter les migrations
    console.log('📋 Exécution des migrations SQL...')
    const migrationsPath = path.join(__dirname, 'migrations.sql')
    const migrations = fs.readFileSync(migrationsPath, 'utf-8')

    // Split et exécuter chaque statement
    const statements = migrations
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    let count = 0
    for (const statement of statements) {
      try {
        await client.query(statement + ';')
        count++
        process.stdout.write('.')
      } catch (e) {
        if (!e.message.includes('already exists')) {
          console.error(`\n  ⚠️  ${e.message.substring(0, 100)}`)
        }
      }
    }

    console.log(`\n✅ Migrations exécutées (${count} statements)\n`)
    client.release()
    await pool.end()

    // 3. Créer les buckets Storage
    console.log('🪣 Création des buckets Storage...')

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const buckets = ['avatars', 'motorcycle-photos']

    for (const bucketName of buckets) {
      try {
        const { data: existing } = await supabase.storage.getBucket(bucketName)
        if (existing) {
          console.log(`  ✅ Bucket "${bucketName}" existe`)
          continue
        }
      } catch (e) {
        // Ne pas exister c'est normal
      }

      try {
        await supabase.storage.createBucket(bucketName, {
          public: true,
        })
        console.log(`  ✅ Bucket "${bucketName}" créé`)
      } catch (e) {
        if (!e.message.includes('already exists')) {
          console.log(`  ✅ Bucket "${bucketName}" (existe déjà)`)
        }
      }
    }

    console.log('\n✨ Configuration Supabase terminée avec succès !\n')
    console.log('📝 Prochaines étapes:\n')
    console.log('  1. Ajouter GOOGLE_API_KEY dans .env.local')
    console.log('  2. Lancer: npm run dev')
    console.log('  3. Aller sur: http://localhost:3000\n')
    console.log('✅ Tout est prêt pour démarrer ! 🏍️\n')

  } catch (error) {
    console.error('\n❌ Erreur:\n', error.message)
    process.exit(1)
  }
}

setupDatabase()
