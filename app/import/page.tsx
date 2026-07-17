'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Member } from '@/lib/types'

type FileType = 'gpx' | 'kml'

export default function ImportPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [fileType, setFileType] = useState<FileType>('gpx')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) return

    const fetchMember = async () => {
      const { data } = await supabase.from('members').select('*').eq('id', user.id).single()
      setMember(data)
    }

    fetchMember()
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file || !user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const text = await file.text()

      if (fileType === 'gpx') {
        await handleGPXUpload(text)
      } else if (fileType === 'kml') {
        await handleKMLUpload(text)
      }

      setSuccess(`${fileType.toUpperCase()} importé avec succès!`)
      setFile(null)
      setTimeout(() => router.push('/map'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import')
    } finally {
      setLoading(false)
    }
  }

  const handleGPXUpload = async (gpxText: string) => {
    // Parse GPX and extract track info
    const parser = new DOMParser()
    const doc = parser.parseFromString(gpxText, 'text/xml')

    if (doc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Fichier GPX invalide')
    }

    // Get metadata
    const tracks = doc.getElementsByTagName('trk')
    const routes = doc.getElementsByTagName('rte')

    const segments = Array.from(tracks)
      .flatMap((trk) => Array.from(trk.getElementsByTagName('trkseg')))
      .concat(
        Array.from(routes).map((rte) => {
          const wrapper = document.createElement('trkseg')
          Array.from(rte.getElementsByTagName('rtept')).forEach((pt) => {
            const pt_el = document.createElement('trkpt')
            pt_el.setAttribute('lat', pt.getAttribute('lat') || '')
            pt_el.setAttribute('lon', pt.getAttribute('lon') || '')
            wrapper.appendChild(pt_el)
          })
          return wrapper
        })
      )

    if (segments.length === 0) {
      throw new Error('Aucune trace trouvée dans le fichier GPX')
    }

    // Calculate distance (simplified)
    let totalDistance = 0
    segments.forEach((seg) => {
      const points = Array.from(seg.getElementsByTagName('trkpt'))
      for (let i = 0; i < points.length - 1; i++) {
        const lat1 = parseFloat(points[i].getAttribute('lat') || '0')
        const lon1 = parseFloat(points[i].getAttribute('lon') || '0')
        const lat2 = parseFloat(points[i + 1].getAttribute('lat') || '0')
        const lon2 = parseFloat(points[i + 1].getAttribute('lon') || '0')

        const R = 6371 // Earth radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180
        const dLon = ((lon2 - lon1) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        totalDistance += R * c
      }
    })

    // Store GPX track
    const { error } = await supabase.from('gpx_tracks').insert({
      member_id: user!.id,
      fichier_gpx_url: `gpx_${Date.now()}.gpx`,
      distance_km: Math.round(totalDistance * 100) / 100,
      duree: '00:00', // TODO: parse from GPX metadata
    })

    if (error) throw error
  }

  const handleKMLUpload = async (kmlText: string) => {
    // Parse KML and extract placemarks
    const parser = new DOMParser()
    const doc = parser.parseFromString(kmlText, 'text/xml')

    if (doc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Fichier KML invalide')
    }

    const placemarks = doc.getElementsByTagName('Placemark')

    if (placemarks.length === 0) {
      throw new Error('Aucun lieu trouvé dans le fichier KML')
    }

    // Import each placemark as a visited place
    const placesTemp: any[] = []

    Array.from(placemarks).forEach((pm) => {
      const nameEl = pm.getElementsByTagName('name')[0]
      const descEl = pm.getElementsByTagName('description')[0]
      const pointEl = pm.getElementsByTagName('Point')[0]

      if (!pointEl) return

      const coordsEl = pointEl.getElementsByTagName('coordinates')[0]
      if (!coordsEl || !coordsEl.textContent) return

      const coords = coordsEl.textContent.trim().split(',')
      const lon = parseFloat(coords[0])
      const lat = parseFloat(coords[1])

      placesTemp.push({
        nom: nameEl?.textContent || 'Sans nom',
        description: descEl?.textContent || null,
        latitude: lat,
        longitude: lon,
        type_lieu: 'autre',
        pays: 'France', // TODO: detect from coords
        region: null,
        date_visite: new Date().toISOString(),
      })
    })

    if (placesTemp.length === 0) {
      throw new Error('Aucun lieu valide à importer')
    }

    // Insert places
    const { error } = await supabase.from('visited_places').insert(placesTemp)

    if (error) throw error
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
        Importer
      </h1>
      <p className="text-slate-400 mb-8">Traces GPX ou lieux depuis Google My Maps</p>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 text-red-400 mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-900/20 text-green-400 mb-6">
          {success}
        </div>
      )}

      {/* File type selector */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {(['gpx', 'kml'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFileType(type)}
            className={`p-4 rounded-lg font-semibold transition ${
              fileType === type
                ? 'bg-orange-600 text-white'
                : 'bg-slate-800 border border-slate-700 hover:border-orange-600'
            }`}
          >
            {type.toUpperCase()}
            <p className="text-xs mt-1">
              {type === 'gpx' && 'Traces Calimoto'}
              {type === 'kml' && 'Google My Maps'}
            </p>
          </button>
        ))}
      </div>

      {/* File input */}
      <div className="mb-8 p-4 rounded-lg border-2 border-dashed border-slate-700">
        <input
          type="file"
          accept={fileType === 'gpx' ? '.gpx' : '.kml,.kmz'}
          onChange={handleFileChange}
          className="w-full"
        />
        {file && <p className="text-sm text-slate-400 mt-2">✓ {file.name}</p>}
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full py-3 px-4 rounded-lg font-semibold transition text-white"
        style={{
          backgroundColor: !file || loading ? '#475569' : '#D9622B',
        }}
      >
        {loading ? '⏳ Importation...' : '📤 Importer'}
      </button>

      {/* Info */}
      <div className="mt-8 p-4 rounded-lg bg-slate-900">
        <p className="text-sm text-slate-400 mb-2">💡 Comment exporter?</p>
        <ul className="text-xs text-slate-400 space-y-2">
          <li>• <strong>GPX:</strong> Depuis Calimoto, partager → télécharger GPX</li>
          <li>• <strong>KML:</strong> Google My Maps → menu ⋮ → télécharger → fichier KML</li>
        </ul>
      </div>
    </div>
  )
}
