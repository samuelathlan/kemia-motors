import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    await supabase.auth.exchangeCodeForSession(code)

    // Create or update member profile if needed
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: memberExists } = await supabase
        .from('members')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!memberExists) {
        await supabase.from('members').insert({
          id: user.id,
          pseudo: user.user_metadata?.name || user.email?.split('@')[0] || 'member',
          nom_affiche: user.user_metadata?.full_name || user.user_metadata?.name || 'Member',
          statut: 'en_attente_acceptation_charte',
          date_inscription: new Date().toISOString(),
        })
      }
    }
  }

  // Redirect to dashboard or charter
  return NextResponse.redirect(new URL('/charter', requestUrl.origin))
}
