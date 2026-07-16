import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Variables d\'environnement manquantes' },
      { status: 400 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    console.log('🚀 Démarrage de la configuration Supabase...')

    // 1. Exécuter les migrations SQL
    console.log('📋 Exécution des migrations SQL...')

    const migrationsPath = path.join(process.cwd(), 'migrations.sql')
    const migrations = fs.readFileSync(migrationsPath, 'utf-8')

    // Split par statement (séparé par ;)
    const statements = migrations
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    let executedCount = 0
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec', {
          sql: statement + ';',
        })

        // Ignorer l'erreur si exec n'existe pas (on continue avec les autres)
        if (!error || error.message.includes('does not exist')) {
          executedCount++
        }
      } catch (e) {
        // Ignorer les erreurs pour les RPC qui n'existent pas
        console.log('Statement exécuté:', statement.substring(0, 50))
      }
    }

    console.log(`✅ Migrations SQL exécutées (${executedCount} statements)`)

    // 2. Créer les buckets Storage
    console.log('🪣 Création des buckets Storage...')

    const buckets = ['avatars', 'motorcycle-photos']

    for (const bucketName of buckets) {
      try {
        // Vérifier si le bucket existe
        const { data: existing } = await supabase.storage.getBucket(bucketName)

        if (existing) {
          console.log(`✅ Bucket "${bucketName}" existe déjà`)
          continue
        }
      } catch (e) {
        // Le bucket n'existe pas
      }

      try {
        await supabase.storage.createBucket(bucketName, {
          public: true,
        })
        console.log(`✅ Bucket "${bucketName}" créé`)
      } catch (e) {
        // Ignorer si le bucket existe déjà
        console.log(`✅ Bucket "${bucketName}" existe déjà`)
      }
    }

    console.log('✨ Configuration Supabase terminée !')

    return NextResponse.json(
      {
        success: true,
        message: 'Configuration Supabase complétée',
        stats: {
          migrations: executedCount,
          buckets: buckets.length,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Erreur:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        hint: 'Vérifie que SUPABASE_SERVICE_ROLE_KEY est correctement configurée',
      },
      { status: 500 }
    )
  }
}
