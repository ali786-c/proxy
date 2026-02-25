
-- Blog posts table for auto-generated content
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  html_content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'proxy',
  tags TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'UpgradedProxy Team',
  cover_image TEXT,
  reading_time_min INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  social_snippet TEXT,
  headings JSONB NOT NULL DEFAULT '[]',
  faqs JSONB NOT NULL DEFAULT '[]',
  related_slugs TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Distribution log for tracking social posts
CREATE TABLE public.distribution_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('discord', 'telegram', 'facebook', 'linkedin', 'rss')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-blog configuration
CREATE TABLE public.auto_blog_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'twice_weekly', 'weekly')),
  discord_enabled BOOLEAN NOT NULL DEFAULT false,
  telegram_enabled BOOLEAN NOT NULL DEFAULT false,
  facebook_enabled BOOLEAN NOT NULL DEFAULT false,
  linkedin_enabled BOOLEAN NOT NULL DEFAULT false,
  last_generated_at TIMESTAMPTZ,
  topics TEXT[] NOT NULL DEFAULT ARRAY['proxy services', 'web scraping', 'data collection', 'network security', 'residential proxies', 'mobile proxies', 'datacenter proxies', 'IP rotation', 'geo-targeting', 'ad verification', 'brand protection', 'SEO monitoring', 'price intelligence', 'AI training data'],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default config row
INSERT INTO public.auto_blog_config (id, is_enabled) VALUES (gen_random_uuid(), false);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_blog_config ENABLE ROW LEVEL SECURITY;

-- Blog posts: public read for published, admin full access
CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Distribution log: admin only
CREATE POLICY "Admins can manage distribution log" ON public.distribution_log
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto blog config: admin only
CREATE POLICY "Admins can manage auto blog config" ON public.auto_blog_config
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view auto blog config" ON public.auto_blog_config
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auto_blog_config_updated_at
  BEFORE UPDATE ON public.auto_blog_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for slug lookups and published posts
CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts (status, published_at DESC);
CREATE INDEX idx_distribution_log_post ON public.distribution_log (blog_post_id);
