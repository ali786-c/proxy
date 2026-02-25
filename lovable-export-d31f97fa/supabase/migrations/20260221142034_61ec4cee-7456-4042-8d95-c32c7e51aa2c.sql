
-- Newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  source TEXT NOT NULL DEFAULT 'website'
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Admins can view all subscribers
CREATE POLICY "Admins can manage newsletter subscribers"
  ON public.newsletter_subscribers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Subscribers can unsubscribe themselves (by email match not needed since public)
CREATE POLICY "Anyone can view own subscription by email"
  ON public.newsletter_subscribers FOR SELECT
  USING (true);

-- Add new platform columns to auto_blog_config
ALTER TABLE public.auto_blog_config
  ADD COLUMN IF NOT EXISTS twitter_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reddit_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS newsletter_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS google_indexing_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_sitemap_enabled BOOLEAN NOT NULL DEFAULT true;
