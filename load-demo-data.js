#!/usr/bin/env node

/**
 * Load demo data pour Kemia Motors
 * 3 membres, 2 sorties, 5 lieux, 2 motos
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://zvlmxsgvkdogbnnldauy.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bG14c2d2a2RvZ2JubmxkYXV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIyNzc1MywiZXhwIjoyMDk5ODAzNzUzfQ.XI35ysOmq6X201a776Szxovz75xfBPMsZDlFYfVuKGc'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function loadDemoData() {
  console.log('\n📊 Chargement des données de démo...\n')

  try {
    // Membres (utiliser des UUIDs fixes pour les démos)
    const members = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        pseudo: 'captain_max',
        nom_affiche: 'Max',
        role: 'super_admin',
        statut: 'membre_actif',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        pseudo: 'alex_rider',
        nom_affiche: 'Alex',
        role: 'membre',
        statut: 'membre_actif',
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        pseudo: 'sunny_roads',
        nom_affiche: 'Sam',
        role: 'membre',
        statut: 'membre_actif',
      },
    ]

    console.log('👥 Création des membres...')
    const { error: membersError } = await supabase
      .from('members')
      .upsert(members, { onConflict: 'id' })

    if (membersError) throw membersError
    console.log(`   ✅ ${members.length} membres créés\n`)

    // Charte du club
    console.log('📜 Création de la charte...')
    const charter = [
      {
        titre_article: 'Esprit du Club',
        texte_complet: 'Kemia Motors, c\'est l\'esprit de partage et l\'amour de la route. Nous roulons ensemble pour découvrir, apprendre et créer des souvenirs durables.',
        ordre_affichage: 1,
      },
      {
        titre_article: 'Sécurité',
        texte_complet: 'La sécurité est notre priorité absolue. Chaque sortie doit être planifiée, et chaque pilote doit être responsable de son équipement et de son comportement sur la route.',
        ordre_affichage: 2,
      },
      {
        titre_article: 'Respect et Inclusivité',
        texte_complet: 'Nous respectons chaque membre, indépendamment de l\'expérience ou du type de moto. Aucune discrimination, aucun jugement. Nous sommes une famille.',
        ordre_affichage: 3,
      },
    ]

    const { data: charterData, error: charterError } = await supabase
      .from('club_charter')
      .upsert(charter, { onConflict: 'titre_article' })

    if (charterError) throw charterError
    console.log(`   ✅ ${charter.length} articles créés\n`)

    // Motos
    console.log('🏍️  Création des motos...')
    const motos = [
      {
        member_id: '00000000-0000-0000-0000-000000000001',
        marque: 'Honda',
        modele: 'CB1000R',
        annee: 2020,
        kilometrage_total: 45000,
        surnom: 'Le Monstre Noir',
      },
      {
        member_id: '00000000-0000-0000-0000-000000000002',
        marque: 'Triumph',
        modele: 'Street Twin',
        annee: 2019,
        kilometrage_total: 32000,
        surnom: 'Le Brit',
      },
      {
        member_id: '00000000-0000-0000-0000-000000000003',
        marque: 'Yamaha',
        modelo: 'MT-09',
        annee: 2021,
        kilometrage_total: 28000,
        surnom: 'La Bête Bleue',
      },
    ]

    const { error: motosError } = await supabase
      .from('motorcycles')
      .insert(motos)
      .select()

    if (motosError && !motosError.message.includes('already exists')) {
      throw motosError
    }
    console.log(`   ✅ ${motos.length} motos créées\n`)

    // Sorties
    console.log('📍 Création des sorties...')
    const outings = [
      {
        titre: 'Roadtrip Alpes du Sud',
        description: 'Une magnifique échappée dans les Alpes du Sud avec arrêts gourmands et panoramas époustouflants',
        date_debut: '2024-08-15',
        date_fin: '2024-08-17',
        type: 'roadtrip_multi_jours',
        cree_par: '00000000-0000-0000-0000-000000000001',
      },
      {
        titre: 'Balade côtière',
        description: 'Sortie d\'une journée le long de la côte méditerranéenne',
        date_debut: '2024-09-10',
        date_fin: '2024-09-10',
        type: 'sortie_simple',
        cree_par: '00000000-0000-0000-0000-000000000002',
      },
    ]

    const { data: outingsData, error: outingsError } = await supabase
      .from('outings')
      .insert(outings)
      .select()

    if (outingsError) throw outingsError
    console.log(`   ✅ ${outings.length} sorties créées\n`)

    // Lieux visités
    console.log('🗺️  Création des lieux...')
    const places = [
      {
        nom: 'Col de la Bonette',
        description: 'Le plus haut col routier des Alpes, à 2715m. Descente spectaculaire.',
        latitude: 44.0667,
        longitude: 6.8333,
        type_lieu: 'nature',
        pays: 'France',
        region: 'Provence-Alpes-Côte d\'Azur',
      },
      {
        nom: 'Refuge Napoléon',
        description: 'Petit refuge de montagne avec vue panoramique incroyable. Accueil chaleureux et bonne nourriture.',
        latitude: 44.05,
        longitude: 6.85,
        type_lieu: 'culinaire',
        pays: 'France',
        region: 'Provence-Alpes-Côte d\'Azur',
      },
      {
        nom: 'Antibes',
        description: 'Ville côtière pittoresque avec vieille ville médiévale',
        latitude: 43.58,
        longitude: 7.12,
        type_lieu: 'historique',
        pays: 'France',
        region: 'Provence-Alpes-Côte d\'Azur',
      },
    ]

    const { error: placesError } = await supabase
      .from('visited_places')
      .insert(places)

    if (placesError) throw placesError
    console.log(`   ✅ ${places.length} lieux créés\n`)

    console.log('✨ Données de démo chargées avec succès!\n')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.log('\n💡 Les données de démo ne sont pas critiques.')
    console.log('   L\'app fonctionne sans elles.\n')
  }
}

loadDemoData()
