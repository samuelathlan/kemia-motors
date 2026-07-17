import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      )
    }

    const { dayId } = await request.json()

    if (!dayId) {
      return NextResponse.json(
        { error: 'dayId is required' },
        { status: 400 }
      )
    }

    // Get day details
    const { data: day, error: dayError } = await supabase
      .from('outing_days')
      .select('*')
      .eq('id', dayId)
      .single()

    if (dayError) throw dayError

    // Get anecdotes for this day
    const { data: anecdotes, error: anecdoteError } = await supabase
      .from('anecdotes')
      .select('*')
      .eq('outing_day_id', dayId)

    if (anecdoteError) throw anecdoteError

    // Get visited places for this day
    const { data: places, error: placesError } = await supabase
      .from('visited_places')
      .select('*')
      .eq('outing_day_id', dayId)

    if (placesError) throw placesError

    // Build prompt
    const prompt = buildPrompt(day, anecdotes || [], places || [])

    // Call Google Gemini API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GOOGLE_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error('Gemini API error:', result)
      return NextResponse.json(
        { error: 'Failed to generate summary' },
        { status: 500 }
      )
    }

    const summary = result.contents[0]?.parts[0]?.text || ''

    // Save to database
    const { error: updateError } = await supabase
      .from('outing_days')
      .update({
        resume_ia: summary,
        resume_genere_at: new Date().toISOString(),
      })
      .eq('id', dayId)

    if (updateError) throw updateError

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function buildPrompt(
  day: any,
  anecdotes: any[],
  places: any[]
): string {
  let prompt = `Génère un résumé narratif court (200-300 mots) et chaleureux de cette journée de roadtrip moto:

**Jour ${day.numero_jour}${day.titre_du_jour ? ': ' + day.titre_du_jour : ''}**

**Notes du jour:**
${day.notes_du_jour || 'Aucune note'}

**Lieux visités:**
${places.length > 0
  ? places.map((p) => `- ${p.nom}${p.description ? ': ' + p.description : ''}`).join('\n')
  : 'Aucun lieu spécifique renseigné'
}

**Anecdotes et moments mémorables:**
${anecdotes.length > 0
  ? anecdotes.map((a) => `- ${a.texte}`).join('\n\n')
  : 'Aucune anecdote enregistrée'
}

${day.hebergement_nom ? `**Hébergement:** ${day.hebergement_nom}` : ''}

Écris un résumé fluide et engageant, comme un carnet de voyage, qui capture l'essence de la journée.`

  return prompt
}
