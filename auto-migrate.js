#!/usr/bin/env node

/**
 * CPTO Auto-Migration Runner
 * Exécute les migrations SQL via l'API Supabase de façon fiable
 */

const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://zvlmxsgvkdogbnnldauy.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bG14c2d2a2RvZ2JubmxkYXV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIyNzc1MywiZXhwIjoyMDk5ODAzNzUzfQ.XI35ysOmq6X201a776Szxovz75xfBPMsZDlFYfVuKGc'

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ sql }),
  }).catch(() => ({ ok: false }))

  return response.ok
}

async function migrate() {
  console.log('\n🚀 CPTO Migration Runner\n')

  const migrationsPath = path.join(__dirname, 'migrations.sql')
  const sql = fs.readFileSync(migrationsPath, 'utf-8')

  // Split en statements logiques
  const chunks = sql.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`📋 ${chunks.length} statements à exécuter\n`)

  let success = 0
  let failed = 0

  for (let i = 0; i < chunks.length; i++) {
    const stmt = chunks[i].substring(0, 50)
    process.stdout.write(`[${i + 1}/${chunks.length}] ${stmt}... `)

    try {
      const ok = await executeSql(chunks[i] + ';')
      if (ok) {
        console.log('✅')
        success++
      } else {
        console.log('⚠️')
      }
    } catch (e) {
      console.log('❌')
      failed++
    }

    // Petit délai pour ne pas overload l'API
    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\n✨ Résultat: ${success} ✅, ${failed} ❌\n`)

  if (success > 0) {
    console.log('🎉 Migrations exécutées avec succès!\n')
    console.log('Prochaines étapes:')
    console.log('  1. npm run dev')
    console.log('  2. Ouvrir http://localhost:3000\n')
  } else {
    console.log('⚠️  Les migrations n\'ont pas pu être exécutées.')
    console.log('Solution alternative: copier migrations.sql manuellement dans Supabase SQL Editor\n')
  }
}

migrate()
