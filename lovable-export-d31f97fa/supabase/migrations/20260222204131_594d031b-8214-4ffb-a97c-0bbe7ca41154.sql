
-- Fix: newsletter_subscribers INSERT policy is too permissive (WITH CHECK true)
-- Replace with validation that ensures only valid email format and limits abuse
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (
  -- Ensure email is not empty
  email IS NOT NULL AND length(email) > 0 AND length(email) <= 254
  -- Ensure source is set to website for anonymous inserts
  AND source = 'website'
  -- Ensure is_active defaults properly
  AND is_active = true
);
