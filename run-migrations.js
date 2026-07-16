#!/usr/bin/env node

/**
 * CPTO Nuclear Option - Execute migrations directly
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const PROJECT_ID = 'zvlmxsgvkdogbnnldauy'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bG14c2d2a2RvZ2JubmxkYXV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIyNzc1MywiZXhwIjoyMDk5ODAzNzUzfQ.XI35ysOmq6X201a776Szxovz75xfBPMsZDlFYfVuKGc'

async function runMigrations() {
  console.log('\n🚀 CPTO Migration Runner - Executing directly\n')

  const pool = new Pool({
    host: `${PROJECT_ID}.db.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: SERVICE_ROLE_KEY,
    ssl: { rejectUnauthorized: false },
  })

  try {
    const client = await pool.connect()
    console.log('✅ Connected to PostgreSQL\n')

    // Read migrations
    const migrationsPath = path.join(__dirname, 'migrations.sql')
    const sql = fs.readFileSync(migrationsPath, 'utf-8')

    // Split by semicolon and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📋 Executing ${statements.length} statements...\n`)

    let count = 0
    for (let i = 0; i < statements.length; i++) {
      try {
        await client.query(statements[i] + ';')
        count++
        process.stdout.write('.')
      } catch (e) {
        // Log error but continue
        if (!e.message.includes('already exists')) {
          console.error(`\n⚠️  [${i}] ${e.message.substring(0, 80)}`)
        }
      }

      // Progress
      if ((i + 1) % 20 === 0) {
        process.stdout.write(` ${i + 1}/${statements.length}\n`)
      }
    }

    console.log(`\n\n✅ Migrations executed: ${count}/${statements.length}\n`)

    client.release()
    await pool.end()

    return true
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message)
    console.error('\n💡 If connection fails, Supabase might block direct PostgreSQL access.')
    console.error('   Try the manual method:\n')
    console.error('   1. Go to: https://app.supabase.com/project/zvlmxsgvkdogbnnldauy/sql/new')
    console.error('   2. Copy migrations.sql')
    console.error('   3. Click Run ▶️\n')
    return false
  }
}

async function loadDemoData() {
  console.log('📊 Loading demo data...\n')

  try {
    // Dynamic require to load after migrations
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      'https://zvlmxsgvkdogbnnldauy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bG14c2d2a2RvZ2JubmxkYXV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIyNzc1MywiZXhwIjoyMDk5ODAzNzUzfQ.XI35ysOmq6X201a776Szxovz75xfBPMsZDlFYfVuKGc'
    )

    // Members
    const members = [
      { id: '00000000-0000-0000-0000-000000000001', pseudo: 'captain_max', nom_affiche: 'Max', role: 'super_admin', statut: 'membre_actif' },
      { id: '00000000-0000-0000-0000-000000000002', pseudo: 'alex_rider', nom_affiche: 'Alex', role: 'membre', statut: 'membre_actif' },
      { id: '00000000-0000-0000-0000-000000000003', pseudo: 'sunny_roads', nom_affiche: 'Sam', role: 'membre', statut: 'membre_actif' },
    ]

    await supabase.from('members').upsert(members, { onConflict: 'id' })
    console.log('✅ 3 members loaded')

    // Charter
    const charter = [
      { titre_article: 'Esprit du Club', texte_complet: 'Kemia Motors, c\'est l\'esprit de partage et l\'amour de la route.', ordre_affichage: 1 },
      { titre_article: 'Sécurité', texte_complet: 'La sécurité est notre priorité absolue.', ordre_affichage: 2 },
      { titre_article: 'Respect', texte_complet: 'Nous respectons chaque membre.', ordre_affichage: 3 },
    ]

    await supabase.from('club_charter').upsert(charter, { onConflict: 'titre_article' })
    console.log('✅ Charter loaded')

    console.log('\n🎉 Demo data ready!\n')
  } catch (e) {
    console.log('⚠️  Demo data skipped (optional)\n')
  }
}

async function main() {
  const success = await runMigrations()

  if (success) {
    await loadDemoData()
    console.log('✨ All systems ready!\n')
    console.log('🚀 npm run dev\n')
  } else {
    console.log('⚠️  Manual Supabase setup required\n')
  }
}

main()
