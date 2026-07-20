// Client-side GPX parsing: distance (Haversine) + duration (from point timestamps)

export interface GPXStats {
  distanceKm: number
  dureeMinutes: number | null
  duree: string // "HH:MM"
  pointCount: number
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDuration(minutes: number | null): string {
  if (minutes == null) return '00:00'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Parses a GPX file's text and returns distance + duration.
 * Handles both <trk>/<trkseg>/<trkpt> tracks and <rte>/<rtept> routes.
 * Duration is derived from the first/last <time> elements when present.
 */
export function parseGPX(gpxText: string): GPXStats {
  const doc = new DOMParser().parseFromString(gpxText, 'text/xml')
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Fichier GPX invalide')
  }

  // Collect ordered points from tracks, then routes as a fallback
  const collectPoints = (tagName: string) =>
    Array.from(doc.getElementsByTagName(tagName)).map((pt) => ({
      lat: parseFloat(pt.getAttribute('lat') || '0'),
      lon: parseFloat(pt.getAttribute('lon') || '0'),
      time: pt.getElementsByTagName('time')[0]?.textContent || null,
    }))

  let points = collectPoints('trkpt')
  if (points.length === 0) points = collectPoints('rtept')

  if (points.length === 0) {
    throw new Error('Aucune trace trouvée dans le fichier GPX')
  }

  let distanceKm = 0
  for (let i = 0; i < points.length - 1; i++) {
    distanceKm += haversine(points[i].lat, points[i].lon, points[i + 1].lat, points[i + 1].lon)
  }

  // Duration from timestamps
  const times = points.map((p) => p.time).filter((t): t is string => !!t)
  let dureeMinutes: number | null = null
  if (times.length >= 2) {
    const start = new Date(times[0]).getTime()
    const end = new Date(times[times.length - 1]).getTime()
    if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
      dureeMinutes = Math.round((end - start) / 60000)
    }
  }

  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    dureeMinutes,
    duree: formatDuration(dureeMinutes),
    pointCount: points.length,
  }
}
