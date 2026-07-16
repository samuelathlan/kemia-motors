/**
 * CPTO Init Route - Initialize Supabase
 * Call once: GET /api/init
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing env vars' },
      { status: 400 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  try {
    console.log('🚀 CPTO Init: Checking tables...')

    // Check if tables exist
    const { error: checkError } = await supabase
      .from('members')
      .select('count', { count: 'exact' })
      .limit(1)

    if (!checkError) {
      return NextResponse.json({
        status: 'ready',
        message: '✅ Supabase déjà initialisée',
      })
    }

    console.log('📋 Migrations SQL required...')

    // Read migrations
    const migrationsPath = path.join(process.cwd(), 'migrations.sql')
    const migrations = fs.readFileSync(migrationsPath, 'utf-8')

    // Try to execute via direct SQL (won't work via REST API, need manual setup)
    return NextResponse.json({
      status: 'needs_migration',
      message: 'Les migrations SQL doivent être exécutées manuellement',
      instructions: {
        step1: 'Aller sur: https://app.supabase.com/project/zvlmxsgvkdogbnnldauy/sql/new',
        step2: 'Copier-coller migrations.sql',
        step3: 'Clicker Run (▶️)',
        step4: 'Puis aller sur: /api/init?verify=true',
      },
      migrations: migrations.substring(0, 500) + '...',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Setup failed',
      },
      { status: 500 }
    )
  }
}
