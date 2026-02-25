
-- ═══════════════════════════════════════════════════════════
-- WHITE-LABEL / RESELLER PORTAL
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.reseller_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_name text NOT NULL,
  brand_logo_url text,
  brand_primary_color text DEFAULT '#3B82F6',
  brand_secondary_color text DEFAULT '#1E40AF',
  custom_domain text,
  is_active boolean NOT NULL DEFAULT true,
  commission_rate numeric NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.reseller_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resellers can view own profile" ON public.reseller_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Resellers can update own profile" ON public.reseller_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage reseller profiles" ON public.reseller_profiles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.reseller_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL REFERENCES public.reseller_profiles(id) ON DELETE CASCADE,
  client_user_id uuid NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reseller_id, client_user_id)
);

ALTER TABLE public.reseller_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resellers can view own clients" ON public.reseller_clients
  FOR SELECT USING (reseller_id IN (SELECT id FROM public.reseller_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Resellers can manage own clients" ON public.reseller_clients
  FOR ALL USING (reseller_id IN (SELECT id FROM public.reseller_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage reseller clients" ON public.reseller_clients
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ═══════════════════════════════════════════════════════════
-- FRAUD DETECTION
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.fraud_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  signal_type text NOT NULL, -- 'login_anomaly', 'usage_spike', 'impossible_travel', 'rapid_auth'
  severity text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  geo_country text,
  geo_city text,
  is_resolved boolean NOT NULL DEFAULT false,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fraud_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fraud signals" ON public.fraud_signals
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.user_risk_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  risk_score integer NOT NULL DEFAULT 0, -- 0-100
  risk_level text NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  factors jsonb DEFAULT '[]'::jsonb,
  last_calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage risk scores" ON public.user_risk_scores
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own risk score" ON public.user_risk_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ip_address text,
  user_agent text,
  geo_country text,
  geo_city text,
  success boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own login history" ON public.login_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage login history" ON public.login_history
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ═══════════════════════════════════════════════════════════
-- SLA MONITORING + UPTIME CREDITS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.sla_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proxy_type text NOT NULL,
  guaranteed_uptime numeric NOT NULL DEFAULT 99.9,
  credit_per_percent numeric NOT NULL DEFAULT 5, -- credit % per 1% downtime
  measurement_window text NOT NULL DEFAULT 'monthly',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(proxy_type)
);

ALTER TABLE public.sla_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view SLA configs" ON public.sla_configs
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage SLA configs" ON public.sla_configs
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.uptime_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proxy_type text NOT NULL,
  region text DEFAULT 'global',
  status text NOT NULL DEFAULT 'up', -- 'up', 'degraded', 'down'
  response_time_ms integer,
  checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.uptime_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view uptime records" ON public.uptime_records
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage uptime records" ON public.uptime_records
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.sla_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  proxy_type text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  actual_uptime numeric NOT NULL,
  guaranteed_uptime numeric NOT NULL,
  credit_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'applied', 'denied'
  applied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sla_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own SLA credits" ON public.sla_credits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage SLA credits" ON public.sla_credits
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ═══════════════════════════════════════════════════════════
-- MULTI-CURRENCY
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.supported_currencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  symbol text NOT NULL,
  exchange_rate numeric NOT NULL DEFAULT 1, -- relative to USD
  is_active boolean NOT NULL DEFAULT true,
  auto_detect_regions text[] DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.supported_currencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view currencies" ON public.supported_currencies
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage currencies" ON public.supported_currencies
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default currencies
INSERT INTO public.supported_currencies (code, name, symbol, exchange_rate, auto_detect_regions) VALUES
  ('USD', 'US Dollar', '$', 1, ARRAY['US', 'PR', 'GU']),
  ('EUR', 'Euro', '€', 0.92, ARRAY['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'FI', 'PT', 'IE', 'GR']),
  ('GBP', 'British Pound', '£', 0.79, ARRAY['GB']),
  ('CAD', 'Canadian Dollar', 'C$', 1.36, ARRAY['CA']),
  ('AUD', 'Australian Dollar', 'A$', 1.53, ARRAY['AU']),
  ('JPY', 'Japanese Yen', '¥', 149.5, ARRAY['JP']),
  ('BRL', 'Brazilian Real', 'R$', 4.97, ARRAY['BR']),
  ('INR', 'Indian Rupee', '₹', 83.1, ARRAY['IN']),
  ('CNY', 'Chinese Yuan', '¥', 7.24, ARRAY['CN']),
  ('KRW', 'Korean Won', '₩', 1320, ARRAY['KR']);

-- Add currency preference to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_currency text DEFAULT 'USD';

-- ═══════════════════════════════════════════════════════════
-- CUSTOM PROXY ENDPOINT DOMAINS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.custom_proxy_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  domain text NOT NULL UNIQUE,
  proxy_type text NOT NULL,
  ssl_status text NOT NULL DEFAULT 'pending', -- 'pending', 'issuing', 'active', 'failed'
  dns_verified boolean NOT NULL DEFAULT false,
  dns_txt_record text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_proxy_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own domains" ON public.custom_proxy_domains
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own domains" ON public.custom_proxy_domains
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own domains" ON public.custom_proxy_domains
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own domains" ON public.custom_proxy_domains
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all domains" ON public.custom_proxy_domains
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_reseller_profiles_updated_at BEFORE UPDATE ON public.reseller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_risk_scores_updated_at BEFORE UPDATE ON public.user_risk_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sla_configs_updated_at BEFORE UPDATE ON public.sla_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_proxy_domains_updated_at BEFORE UPDATE ON public.custom_proxy_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.fraud_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.uptime_records;
