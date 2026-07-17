import { createClient } from '@supabase/supabase-js'

const SECRET = 'kemia-setup-2026' // Change this in prod

export async function POST(req: Request) {
  try {
    const { secret, email, password } = await req.json()

    if (secret !== SECRET) {
      return Response.json({ error: 'Invalid secret' }, { status: 401 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json({ error: 'Missing env vars' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) throw authError

    const userId = authData.user.id

    // Create member with admin role
    const { error: memberError } = await supabase
      .from('members')
      .insert({
        id: userId,
        email,
        pseudo: 'Admin',
        nom_affiche: email.split('@')[0],
        role: 'super_admin',
        statut: 'membre_actif',
      })

    if (memberError) throw memberError

    return Response.json({
      success: true,
      message: 'Admin créé',
      userId,
      email,
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur' },
      { status: 500 }
    )
  }
}
