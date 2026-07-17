import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { outingId } = await request.json()

    if (!outingId) {
      return NextResponse.json(
        { error: 'outingId is required' },
        { status: 400 }
      )
    }

    // Get outing details
    const { data: outing, error: outingErr } = await supabase
      .from('outings')
      .select('*')
      .eq('id', outingId)
      .single()

    if (outingErr) throw outingErr

    // Get days (if multi-day)
    const { data: days } = await supabase
      .from('outing_days')
      .select('*')
      .eq('outing_id', outingId)
      .order('numero_jour', { ascending: true })

    // Build PDF content as HTML string
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          margin: 40px;
          line-height: 1.6;
        }
        h1 { color: #D9622B; font-size: 32px; border-bottom: 3px solid #D9622B; padding-bottom: 10px; }
        h2 { color: #2F4A38; font-size: 24px; margin-top: 30px; }
        .day { page-break-inside: avoid; border-left: 4px solid #D9622B; padding-left: 20px; margin: 30px 0; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; font-style: italic; }
        .info { color: #666; font-size: 14px; }
        .footer { text-align: center; color: #999; margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; }
      </style>
    </head>
    <body>
      <h1>${outing.titre}</h1>
      <p class="info">
        ${new Date(outing.date_debut).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
        ${outing.date_fin !== outing.date_debut ? ' - ' + new Date(outing.date_fin).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }) : ''}
      </p>
      <p>${outing.description || ''}</p>
    `

    if (days && days.length > 0) {
      for (const day of days) {
        htmlContent += `
        <div class="day">
          <h2>Jour ${day.numero_jour}${day.titre_du_jour ? ': ' + day.titre_du_jour : ''}</h2>
          ${day.hebergement_nom ? `<p><strong>🏨 Hébergement:</strong> ${day.hebergement_nom}</p>` : ''}
          ${day.notes_du_jour ? `<p><strong>📝 Notes:</strong> ${day.notes_du_jour}</p>` : ''}
          ${day.resume_ia ? `<div class="summary"><strong>✨ Résumé IA:</strong><br>${day.resume_ia}</div>` : ''}
        </div>
        `
      }
    }

    htmlContent += `
      <div class="footer">
        <p>Carnet de voyage Kemia Motors • Ride & Share</p>
        <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
    </body>
    </html>
    `

    // Return HTML for client-side PDF generation
    return NextResponse.json({
      html: htmlContent,
      filename: `Kemia_${outing.titre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`,
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
