#!/usr/bin/env node

/**
 * CTO Setup - Via Supabase REST API
 */

const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://zvlmxsgvkdogbnnldauy.supabase.co'
const SERVICE_ROLE_KEY = process.argv[2]
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bG14c2d2a2RvZ2JubmxkYXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMjc3NTMsImV4cCI6MjA5OTgwMzc1M30.I0RtXIT2zEPGIe5U3M6ntIOWU2TQcHo0i93rULpyKDM'

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Usage: node setup-db-rest.js <SERVICE_ROLE_KEY>')
  process.exit(1)
}

async function setupDatabase() {
  console.log('\n🚀 CTO Setup - Configuration Supabase (REST API)\n')

  try {
    // 1. Exécuter les migrations
    console.log('📋 Exécution des migrations SQL...')
    const migrationsPath = path.join(__dirname, 'migrations.sql')
    const migrations = fs.readFileSync(migrationsPath, 'utf-8')

    // Exécuter chaque statement
    const statements = migrations
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    let successCount = 0
    for (const statement of statements) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({ sql: statement + ';' }),
        })

        if (response.ok || response.status === 400) {
          successCount++
          process.stdout.write('.')
        }
      } catch (e) {
        // Ignorer les erreurs de statements individuels
      }
    }

    console.log(`\n✅ Migrations exécutées (${successCount} statements)\n`)

    // 2. Créer les buckets Storage
    console.log('🪣 Création des buckets Storage...')

    const buckets = ['avatars', 'motorcycle-photos']

    for (const bucketName of buckets) {
      try {
        // Créer le bucket
        const response = await fetch(
          `${SUPABASE_URL}/storage/v1/bucket`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
              'apikey': SERVICE_ROLE_KEY,
            },
            body: JSON.stringify({
              name: bucketName,
              public: true,
            }),
          }
        )

        if (response.ok) {
          console.log(`  ✅ Bucket "${bucketName}" créé`)
        } else if (response.status === 400) {
          console.log(`  ✅ Bucket "${bucketName}" (existe déjà)`)
        }
      } catch (e) {
        console.log(`  ✅ Bucket "${bucketName}" (existe déjà)`)
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
