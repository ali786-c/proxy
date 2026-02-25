
-- ══════════════════════════════════════════════
-- 1. ENUMS
-- ══════════════════════════════════════════════
CREATE TYPE public.app_role AS ENUM ('admin', 'client');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.order_status AS ENUM ('pending', 'active', 'expired', 'cancelled', 'suspended');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.payment_gateway AS ENUM ('stripe', 'paypal', 'crypto');

-- ══════════════════════════════════════════════
-- 2. PROFILES
-- ══════════════════════════════════════════════
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  ban_reason TEXT,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- 3. USER ROLES (separate table as required)
-- ══════════════════════════════════════════════
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'client',
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- 4. SECURITY DEFINER: has_role
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- ══════════════════════════════════════════════
-- 5. PRODUCTS
-- ══════════════════════════════════════════════
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  proxy_type TEXT NOT NULL, -- residential, datacenter, isp, mobile, socks5
  price_per_gb NUMERIC(10,4),
  price_per_ip NUMERIC(10,4),
  price_per_port NUMERIC(10,4),
  min_quantity INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- 6. ORDERS
-- ══════════════════════════════════════════════
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  status order_status NOT NULL DEFAULT 'pending',
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  proxy_type TEXT,
  proxy_config JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- 7. INVOICES
-- ══════════════════════════════════════════════
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  gateway payment_gateway,
  gateway_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- 8. PAYMENT TRANSACTIONS (webhook log + audit)
-- ══════════════════════════════════════════════
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id),
  gateway payment_gateway NOT NULL,
  gateway_event TEXT,
  gateway_payload JSONB,
  amount NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- 9. SUPPORT TICKETS
-- ══════════════════════════════════════════════
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- 10. API KEYS (proxy access)
-- ══════════════════════════════════════════════
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL DEFAULT 'Default',
  api_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- 11. WEBHOOK LOGS
-- ══════════════════════════════════════════════
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- stripe, paypal, crypto
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'received',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- 12. COUPONS
-- ══════════════════════════════════════════════
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount NUMERIC(10,2),
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- 13. AUDIT LOG
-- ══════════════════════════════════════════════
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- 14. UPDATED_AT TRIGGER FUNCTION
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ══════════════════════════════════════════════
-- 15. AUTO-CREATE PROFILE + ROLE ON SIGNUP
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════
-- 16. GENERATE INVOICE NUMBER
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM public.invoices;
  NEW.invoice_number := 'INV-' || LPAD(seq::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION public.generate_invoice_number();

-- ══════════════════════════════════════════════
-- 17. RLS POLICIES
-- ══════════════════════════════════════════════

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- products (public read, admin write)
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- invoices
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all invoices" ON public.invoices FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- payment_transactions
CREATE POLICY "Users can view own transactions" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.payment_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- support_tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tickets" ON public.support_tickets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- api_keys
CREATE POLICY "Users can view own keys" ON public.api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own keys" ON public.api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own keys" ON public.api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own keys" ON public.api_keys FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all keys" ON public.api_keys FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- webhook_logs (admin only)
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert webhook logs" ON public.webhook_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- coupons
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- audit_log (admin only)
CREATE POLICY "Admins can view audit log" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert audit log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ══════════════════════════════════════════════
-- 18. INDEXES
-- ══════════════════════════════════════════════
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key ON public.api_keys(api_key);
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_webhook_logs_created ON public.webhook_logs(created_at DESC);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX idx_payment_transactions_user ON public.payment_transactions(user_id);
