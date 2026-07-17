import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 })
    }

    // Get the current user from Supabase auth
    // Note: In production, verify the JWT token in the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    // Verify the invitation code exists and hasn't been used
    const { data: invitation, error: fetchError } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('code', code)
      .is('used_by', null)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation code not found or already used' },
        { status: 404 }
      )
    }

    // Check expiration
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation code has expired' }, { status: 410 })
    }

    // Get user ID from auth (this should come from verified JWT in production)
    // For now, extract from the token passed in request
    // In production: use supabase.auth.getUser() or verify JWT signature
    const token = authHeader.replace('Bearer ', '')

    // Decode JWT (basic parsing - in production use proper JWT verification)
    let userId: string | null = null
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        userId = payload.sub // sub is the user ID in Supabase JWT
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'Could not extract user ID from token' }, { status: 401 })
    }

    // Update invitation_codes to mark as accepted (only the specified user can mark their own)
    const { error: updateError } = await supabase
      .from('invitation_codes')
      .update({
        used_by: userId,
        accepted_at: new Date().toISOString(),
      })
      .eq('code', code)
      .is('used_by', null) // Ensure it hasn't been used in the meantime

    if (updateError) throw updateError

    return NextResponse.json({ success: true, userId })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error marking invitation as accepted' },
      { status: 500 }
    )
  }
}
