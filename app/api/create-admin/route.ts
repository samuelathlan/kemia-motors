import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const email = 'samuel@athlan.fr'
  const password = 'ADCsFMfw3BZVdY9iw7Qr6'

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'Missing env vars' }, { status: 500 })
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
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
        nom_affiche: 'Administrateur',
        role: 'super_admin',
        statut: 'membre_actif',
      })

    if (memberError) throw memberError

    return Response.json({
      success: true,
      message: 'Admin créé avec succès',
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
