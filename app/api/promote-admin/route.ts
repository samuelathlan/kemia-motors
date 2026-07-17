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

    // Find member by email
    const { data: member, error: findError } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .single()

    if (findError) throw findError
    if (!member) throw new Error('Member not found')

    // Update role to super_admin
    const { error: updateError } = await supabase
      .from('members')
      .update({ role: 'super_admin' })
      .eq('id', member.id)

    if (updateError) throw updateError

    return Response.json({
      success: true,
      message: 'Member promoted to admin',
      userId: member.id,
      email,
    })
  } catch (error) {
    console.error('Promote admin error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
