import { createClient } from '@supabase/supabase-js'

const SECRET = 'kemia-setup-2026'

export async function POST(req: Request) {
  try {
    const { secret, email } = await req.json()

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

    // Get auth user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers()

    if (getUserError) throw getUserError

    const authUser = users?.find((u) => u.email === email)
    if (!authUser) throw new Error('Auth user not found')

    // Check if member exists
    const { data: existingMember } = await supabase
      .from('members')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (existingMember) {
      // Just update role
      const { error: updateError } = await supabase
        .from('members')
        .update({ role: 'super_admin' })
        .eq('id', authUser.id)

      if (updateError) throw updateError
    } else {
      // Create new member
      const { error: insertError } = await supabase
        .from('members')
        .insert({
          id: authUser.id,
          email,
          pseudo: email.split('@')[0],
          nom_affiche: email.split('@')[0],
          role: 'super_admin',
          statut: 'membre_actif',
        })

      if (insertError) throw insertError
    }

    return Response.json({
      success: true,
      message: 'Admin setup complete',
      userId: authUser.id,
      email,
    })
  } catch (error) {
    console.error('[setup-complete]', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
