import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    // Create member profile if needed
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: memberExists } = await supabase
        .from('members')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

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

  return NextResponse.redirect(new URL('/charter', requestUrl.origin))
}
