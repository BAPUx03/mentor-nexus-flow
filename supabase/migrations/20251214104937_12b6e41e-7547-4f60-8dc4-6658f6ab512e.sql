-- Fix the security definer view issue by setting to security invoker
ALTER VIEW public.public_profiles SET (security_invoker = true);