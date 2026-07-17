-- Create invitation_codes table
CREATE TABLE IF NOT EXISTS invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  used_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_invitation_codes_code ON invitation_codes(code);
CREATE INDEX idx_invitation_codes_created_by ON invitation_codes(created_by);
CREATE INDEX idx_invitation_codes_used_by ON invitation_codes(used_by);

-- Enable RLS
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;

-- RLS: Members can view invitations they created or that were used by them
CREATE POLICY "Members can view own invitations" ON invitation_codes
  FOR SELECT USING (
    created_by = auth.uid() OR
    used_by = auth.uid() OR
    (SELECT role FROM members WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- RLS: Admins can insert/update
CREATE POLICY "Admins can manage invitations" ON invitation_codes
  FOR INSERT
  WITH CHECK ((SELECT role FROM members WHERE id = auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update invitations" ON invitation_codes
  FOR UPDATE
  USING ((SELECT role FROM members WHERE id = auth.uid()) IN ('admin', 'super_admin'));
