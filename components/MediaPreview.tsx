'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

type MediaPreviewProps = {
  url: string
  plateforme: 'instagram' | 'google_drive' | 'other'
  legende?: string | null
}

export function MediaPreview({ url, plateforme, legende }: MediaPreviewProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        if (plateforme === 'instagram') {
          // Instagram: use Open Graph thumbnail
          const response = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`)
          const data = await response.json()
          setThumbnail(data.image || null)
        } else if (plateforme === 'google_drive') {
          // Google Drive: extract file ID and generate thumbnail URL
          const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
          if (fileId) {
            setThumbnail(`https://drive.google.com/thumbnail?id=${fileId}&sz=w200`)
          }
        }
      } catch (err) {
        console.error('Error fetching thumbnail:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchThumbnail()
  }, [url, plateforme])

  if (loading) {
    return <div className="w-24 h-24 rounded bg-slate-800 animate-pulse" />
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 group-hover:border-orange-600 transition">
        {thumbnail ? (
          <div className="relative w-full h-full">
            <Image
              src={thumbnail}
              alt={legende || 'Média'}
              fill
              className="object-cover group-hover:scale-110 transition"
            />
            {plateforme === 'instagram' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition">
                <span className="text-white text-2xl">📸</span>
              </div>
            )}
            {plateforme === 'google_drive' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition">
                <span className="text-white text-2xl">🗂️</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl">
              {plateforme === 'instagram' ? '📸' : plateforme === 'google_drive' ? '🗂️' : '🔗'}
            </span>
          </div>
        )}
      </div>
      {legende && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{legende}</p>
      )}
    </a>
  )
}
