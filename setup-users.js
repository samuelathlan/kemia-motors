#!/usr/bin/env node

/**
 * Setup test users in Supabase via SQL
 * Run via: node setup-users.js
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://zvlmxsgvkdogbnnldauy.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bG14c2d2a2RvZ2JubmxkYXV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIyNzc1MywiZXhwIjoyMDk5ODAzNzUzfQ.XI35ysOmq6X201a776Szxovz75xfBPMsZDlFYfVuKGc'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function setupUsers() {
  console.log('🔧 Setting up test users...\n')

  try {
    // Admin user
    console.log('Creating admin user...')
    const adminResponse = await supabase.auth.admin.createUser({
      email: 'admin@test.fr',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        role: 'super_admin',
      }
    })

    if (adminResponse.error) throw adminResponse.error

    const adminId = adminResponse.data.user.id
    console.log(`✅ Admin user created: ${adminId}`)

    // Create admin member profile
    await supabase.from('members').insert({
      id: adminId,
      pseudo: 'admin_test',
      nom_affiche: 'Admin Test',
      role: 'super_admin',
      statut: 'membre_actif',
      date_acceptation_charte: new Date().toISOString(),
      date_inscription: new Date().toISOString()
    })
    console.log('✅ Admin profile created')

    // Member user
    console.log('\nCreating member user...')
    const memberResponse = await supabase.auth.admin.createUser({
      email: 'membre@test.fr',
      password: 'Member123!',
      email_confirm: true,
      user_metadata: {
        role: 'membre',
      }
    })

    if (memberResponse.error) throw memberResponse.error

    const memberId = memberResponse.data.user.id
    console.log(`✅ Member user created: ${memberId}`)

    // Create member profile
    await supabase.from('members').insert({
      id: memberId,
      pseudo: 'member_test',
      nom_affiche: 'Test Member',
      role: 'membre',
      statut: 'membre_actif',
      date_acceptation_charte: new Date().toISOString(),
      date_inscription: new Date().toISOString()
    })
    console.log('✅ Member profile created')

    // Create demo motorcycles
    console.log('\nCreating demo motorcycles...')
    await supabase.from('motorcycles').insert([
      {
        member_id: adminId,
        marque: 'Harley-Davidson',
        modele: 'Iron 883',
        annee: 2022,
        kilometrage_total: 5400,
        surnom: 'The Beast'
      },
      {
        member_id: memberId,
        marque: 'Kawasaki',
        modele: 'Ninja 400',
        annee: 2023,
        kilometrage_total: 2100,
        surnom: 'Green Rocket'
      }
    ])
    console.log('✅ Motorcycles created')

    // Create charter articles
    console.log('\nCreating charter articles...')
    const charterResponse = await supabase.from('club_charter').insert([
      {
        titre_article: 'Esprit du Club',
        texte_complet: 'Kemia Motors, c\'est l\'esprit de partage et l\'amour de la route.',
        ordre_affichage: 1
      },
      {
        titre_article: 'Sécurité',
        texte_complet: 'La sécurité est notre priorité absolue.',
        ordre_affichage: 2
      },
      {
        titre_article: 'Respect',
        texte_complet: 'Nous respectons chaque membre et leur passion.',
        ordre_affichage: 3
      }
    ]).select()

    if (charterResponse.error) throw charterResponse.error
    console.log('✅ Charter articles created')

    // Accept charter for both users
    console.log('\nAccepting charter for users...')
    for (const charter of charterResponse.data) {
      for (const userId of [adminId, memberId]) {
        await supabase.from('charter_acceptances').insert({
          article_id: charter.id,
          member_id: userId,
          version_acceptee: 1,
          accepted_at: new Date().toISOString()
        })
      }
    }
    console.log('✅ Charter accepted by both users')

    // Create demo outings
    console.log('\nCreating demo outings...')
    const outingsResponse = await supabase.from('outings').insert([
      {
        titre: 'Weekend Route des Alpes',
        description: 'Une belle sortie dans les Alpes suisses',
        date_debut: '2026-07-25T09:00:00Z',
        date_fin: '2026-07-25T18:00:00Z',
        type: 'sortie_simple',
        cree_par: adminId
      },
      {
        titre: 'Roadtrip Côte d\'Azur',
        description: 'Une longue balade le long de la Méditerranée',
        date_debut: '2026-08-01T08:00:00Z',
        date_fin: '2026-08-03T18:00:00Z',
        type: 'roadtrip_multi_jours',
        cree_par: adminId
      }
    ]).select()

    if (outingsResponse.error) throw outingsResponse.error
    console.log('✅ Outings created')

    // Add participants
    console.log('\nAdding participants to outings...')
    for (const outing of outingsResponse.data) {
      for (const userId of [adminId, memberId]) {
        await supabase.from('outing_participants').insert({
          outing_id: outing.id,
          member_id: userId
        })
        await supabase.from('outing_rsvps').insert({
          outing_id: outing.id,
          member_id: userId,
          statut: 'oui'
        })
      }
    }
    console.log('✅ Participants added')

    console.log('\n' + '='.repeat(60))
    console.log('✨ SETUP COMPLETE ✨')
    console.log('='.repeat(60))
    console.log(`
TEST CREDENTIALS:

ADMIN:
  Email: admin@test.fr
  Password: Admin123!
  Role: super_admin
  Access: Everything

MEMBER:
  Email: membre@test.fr
  Password: Member123!
  Role: membre
  Access: Limited (no admin)

Demo Data:
  ✅ 2 Motorcycles
  ✅ 3 Charter articles (pre-accepted)
  ✅ 2 Outings
  ✅ Participants assigned

Ready to test at:
  https://kemia-motors-production.up.railway.app

🚀 START HERE: https://kemia-motors-production.up.railway.app/auth/login
`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

setupUsers()
