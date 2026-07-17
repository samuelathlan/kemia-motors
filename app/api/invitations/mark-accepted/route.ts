import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const { code, userId } = await req.json()

    if (!code || !userId) {
      return NextResponse.json({ error: 'Code and userId required' }, { status: 400 })
    }

    // Update invitation_codes to mark as accepted
    const { error } = await supabase
      .from('invitation_codes')
      .update({
        used_by: userId,
        accepted_at: new Date().toISOString(),
      })
      .eq('code', code)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error marking invitation as accepted' },
      { status: 500 }
    )
  }
}
