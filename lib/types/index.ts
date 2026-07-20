export type MemberRole = 'membre' | 'admin' | 'super_admin'
export type MemberStatus = 'invité' | 'en_attente_acceptation_charte' | 'membre_actif' | 'retiré'
export type OutingType = 'sortie_simple' | 'roadtrip_multi_jours'
export type VenueType = 'historique' | 'culinaire' | 'nature' | 'autre'
export type Platform = 'instagram' | 'google_drive' | 'other'

export interface Member {
  id: string
  pseudo: string
  nom_affiche: string
  avatar_storage_path: string | null
  date_inscription: string
  role: MemberRole
  statut: MemberStatus
  date_acceptation_charte: string | null
  created_at: string
}

export interface EmergencyInfo {
  id: string
  member_id: string
  contact_urgence_nom: string
  contact_urgence_telephone: string
  info_assurance: string
  lien_tribusante: string | null
}

export interface Motorcycle {
  id: string
  member_id: string
  marque: string
  modele: string
  annee: number
  kilometrage_total: number
  surnom: string | null
}

export interface MotorcyclePhoto {
  id: string
  motorcycle_id: string
  storage_path: string
  uploaded_at: string
}

export interface ClubCharter {
  id: string
  titre_article: string
  texte_complet: string
  ordre_affichage: number
  version: number
}

export interface CharterAcceptance {
  id: string
  article_id: string
  member_id: string
  version_acceptee: number | null
  accepted_at: string | null
}

export interface Outing {
  id: string
  titre: string
  description: string
  date_debut: string
  date_fin: string
  type: OutingType
  cree_par: string
  created_at: string
}

export interface OutingParticipant {
  id: string
  outing_id: string
  member_id: string
}

export interface OutingRSVP {
  id: string
  outing_id: string
  member_id: string
  statut: 'oui' | 'non' | 'peut_etre'
  updated_at: string
}

export interface OutingDay {
  id: string
  outing_id: string
  date: string
  numero_jour: number
  titre_du_jour: string
  hebergement_nom: string | null
  hebergement_url: string | null
  hebergement_plateforme: 'booking' | 'airbnb' | 'autre' | null
  notes_du_jour: string
  resume_ia: string | null
  resume_genere_at: string | null
}

export interface Anecdote {
  id: string
  outing_day_id: string | null
  visited_place_id: string | null
  member_id: string
  texte: string
  photo_storage_path: string | null
  created_at: string
}

export interface GPXTrack {
  id: string
  outing_id: string | null
  outing_day_id: string | null
  member_id: string
  fichier_gpx_url: string | null
  lien_calimoto: string | null
  distance_km: number
  duree: string
  duree_minutes: number | null
}

export interface VisitedPlace {
  id: string
  outing_id: string | null
  outing_day_id: string | null
  nom: string
  description: string | null
  latitude: number
  longitude: number
  date_visite: string | null
  type_lieu: VenueType
  pays: string
  region: string | null
  lien_google_maps: string | null
  lien_instagram: string | null
  lien_google_drive: string | null
}

export interface MediaLink {
  id: string
  outing_id: string | null
  outing_day_id: string | null
  visited_place_id: string | null
  member_id: string
  url: string
  plateforme: Platform
  legende: string | null
}
