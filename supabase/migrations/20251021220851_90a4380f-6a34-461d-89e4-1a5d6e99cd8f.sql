-- Update RLS policies to allow admin operations without authentication
-- This is needed because the admin panel uses a password but no user authentication

-- Drop existing restrictive policies for restaurants
DROP POLICY IF EXISTS "Service role can update restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Service role can delete restaurants" ON public.restaurants;

-- Add policies that allow authenticated operations (will work with anon key)
CREATE POLICY "Allow all updates to restaurants"
  ON public.restaurants
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes to restaurants"
  ON public.restaurants
  FOR DELETE
  TO public
  USING (true);

-- Allow reading all restaurants (not just published ones) for admin panel
CREATE POLICY "Allow reading all restaurants"
  ON public.restaurants
  FOR SELECT
  TO public
  USING (true);

-- Drop and recreate policies for questionnaires
DROP POLICY IF EXISTS "Anyone can view questionnaires for published restaurants" ON public.restaurant_questionnaires;
DROP POLICY IF EXISTS "Service role can update questionnaires" ON public.restaurant_questionnaires;
DROP POLICY IF EXISTS "Service role can delete questionnaires" ON public.restaurant_questionnaires;

CREATE POLICY "Allow reading all questionnaires"
  ON public.restaurant_questionnaires
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow all updates to questionnaires"
  ON public.restaurant_questionnaires
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes to questionnaires"
  ON public.restaurant_questionnaires
  FOR DELETE
  TO public
  USING (true);

-- Drop and recreate policies for ratings
DROP POLICY IF EXISTS "Service role can add ratings" ON public.restaurant_ratings;
DROP POLICY IF EXISTS "Anyone can view ratings for published restaurants" ON public.restaurant_ratings;
DROP POLICY IF EXISTS "Service role can update ratings" ON public.restaurant_ratings;
DROP POLICY IF EXISTS "Service role can delete ratings" ON public.restaurant_ratings;

CREATE POLICY "Allow all operations on ratings"
  ON public.restaurant_ratings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Drop and recreate policies for publications
DROP POLICY IF EXISTS "Service role can manage publications" ON public.restaurant_publications;
DROP POLICY IF EXISTS "Anyone can view publications" ON public.restaurant_publications;

CREATE POLICY "Allow all operations on publications"
  ON public.restaurant_publications
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);