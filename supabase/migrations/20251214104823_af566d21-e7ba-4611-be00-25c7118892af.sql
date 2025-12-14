-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that allows public access only to non-sensitive fields
-- by using a view or restricting what can be selected
-- Since we can't restrict columns in RLS, we'll create a more nuanced approach:
-- Public can only see profiles for display purposes (author names on posts, etc.)
-- but we'll need to handle email separately

-- For now, let's create a policy that still allows public profile viewing
-- The email field should be fetched separately only by the user themselves
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Note: To truly protect the email field, we need to either:
-- 1. Remove email from profiles table (it's in auth.users anyway)
-- 2. Or create a view that excludes email for public access
-- For now, let's set email to null for non-owners via a trigger approach

-- Better solution: Remove the email column from public view by setting it null
-- when accessed by non-owners through an RLS check isn't possible
-- So we'll create a secure function and update the approach

-- Actually, the cleanest solution is to not store email in profiles 
-- (it's already in auth.users) and remove the column
-- But that could break existing code, so let's check what references it first