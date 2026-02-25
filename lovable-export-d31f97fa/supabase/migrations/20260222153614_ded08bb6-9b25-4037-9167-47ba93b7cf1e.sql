
-- Fix: Prevent users from updating sensitive fields (balance, is_banned, ban_reason) on their own profile.
-- Drop the existing permissive self-update policy and replace with one that blocks sensitive column changes.

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- Ensure balance, is_banned, and ban_reason are not changed by the user
  AND balance = (SELECT p.balance FROM public.profiles p WHERE p.user_id = auth.uid())
  AND is_banned = (SELECT p.is_banned FROM public.profiles p WHERE p.user_id = auth.uid())
  AND ban_reason IS NOT DISTINCT FROM (SELECT p.ban_reason FROM public.profiles p WHERE p.user_id = auth.uid())
);
