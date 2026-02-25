
-- ═══════════════════════════════════════════════════════
-- 1. ENHANCE AUDIT LOG with IP + Geo
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.audit_log 
  ADD COLUMN IF NOT EXISTS ip_address text,
  ADD COLUMN IF NOT EXISTS geo_country text,
  ADD COLUMN IF NOT EXISTS geo_city text,
  ADD COLUMN IF NOT EXISTS user_agent text;

-- ═══════════════════════════════════════════════════════
-- 2. 2FA / TOTP SECRETS
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.user_totp_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  encrypted_secret text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  backup_codes jsonb DEFAULT '[]'::jsonb,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_totp_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own TOTP" ON public.user_totp_secrets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own TOTP" ON public.user_totp_secrets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own TOTP" ON public.user_totp_secrets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own TOTP" ON public.user_totp_secrets
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all TOTP" ON public.user_totp_secrets
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_totp_updated_at BEFORE UPDATE ON public.user_totp_secrets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════
-- 3. ORGANIZATIONS / TEAMS
-- ═══════════════════════════════════════════════════════
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_id uuid NOT NULL,
  avatar_url text,
  billing_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  department text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.org_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  invited_by uuid NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;

-- Helper function to check org membership
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.org_members WHERE user_id = _user_id AND org_id = _org_id)
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _role org_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.org_members WHERE user_id = _user_id AND org_id = _org_id AND role = _role)
$$;

-- Org RLS
CREATE POLICY "Members can view org" ON public.organizations
  FOR SELECT USING (is_org_member(auth.uid(), id));
CREATE POLICY "Owners can update org" ON public.organizations
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Auth users can create org" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins can view all orgs" ON public.organizations
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Org members RLS
CREATE POLICY "Members can view org members" ON public.org_members
  FOR SELECT USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "Org admins can manage members" ON public.org_members
  FOR ALL USING (has_org_role(auth.uid(), org_id, 'owner') OR has_org_role(auth.uid(), org_id, 'admin'));
CREATE POLICY "Admins can view all org members" ON public.org_members
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Org invites RLS
CREATE POLICY "Org admins can manage invites" ON public.org_invites
  FOR ALL USING (has_org_role(auth.uid(), org_id, 'owner') OR has_org_role(auth.uid(), org_id, 'admin'));
CREATE POLICY "Invitees can view own invites" ON public.org_invites
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════
-- 4. GRANULAR RBAC PERMISSIONS  
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view role_permissions" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default permissions
INSERT INTO public.permissions (name, description, category) VALUES
  ('proxy.view', 'View proxy configurations', 'proxy'),
  ('proxy.create', 'Create proxy orders', 'proxy'),
  ('proxy.manage', 'Manage all proxies', 'proxy'),
  ('billing.view', 'View billing information', 'billing'),
  ('billing.manage', 'Manage billing and payments', 'billing'),
  ('support.create', 'Create support tickets', 'support'),
  ('support.manage', 'Manage all support tickets', 'support'),
  ('users.view', 'View user profiles', 'users'),
  ('users.manage', 'Manage user accounts', 'users'),
  ('api.manage', 'Manage API keys', 'api'),
  ('audit.view', 'View audit logs', 'audit'),
  ('settings.manage', 'Manage system settings', 'settings'),
  ('org.manage', 'Manage organizations', 'org');

-- Assign default permissions to roles
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'client', id FROM public.permissions 
WHERE name IN ('proxy.view', 'proxy.create', 'billing.view', 'support.create', 'api.manage');

-- ═══════════════════════════════════════════════════════
-- 5. USAGE RECORDS (metered billing)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  proxy_type text NOT NULL,
  bytes_used bigint NOT NULL DEFAULT 0,
  requests_count integer NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  billed boolean NOT NULL DEFAULT false,
  invoice_id uuid REFERENCES public.invoices(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.usage_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all usage" ON public.usage_records
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage usage" ON public.usage_records
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX idx_usage_records_recorded_at ON public.usage_records(recorded_at);
CREATE INDEX idx_usage_records_billed ON public.usage_records(billed) WHERE billed = false;

-- ═══════════════════════════════════════════════════════
-- 6. ENABLE REALTIME on key tables
-- ═══════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.usage_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
