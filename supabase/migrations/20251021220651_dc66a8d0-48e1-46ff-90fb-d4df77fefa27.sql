-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restaurant questionnaires table
CREATE TABLE public.restaurant_questionnaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restaurant ratings table
CREATE TABLE public.restaurant_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  rating NUMERIC NOT NULL,
  comments TEXT,
  reviewed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restaurant publications table
CREATE TABLE public.restaurant_publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  published_data JSONB NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_publications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants table
-- Allow anyone to insert (public submission form)
CREATE POLICY "Anyone can submit restaurants"
  ON public.restaurants
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only allow reading published restaurants publicly
CREATE POLICY "Anyone can view published restaurants"
  ON public.restaurants
  FOR SELECT
  TO public
  USING (status = 'Published');

-- Only service role can update/delete (for admin panel)
CREATE POLICY "Service role can update restaurants"
  ON public.restaurants
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete restaurants"
  ON public.restaurants
  FOR DELETE
  TO service_role
  USING (true);

-- RLS Policies for restaurant_questionnaires table
-- Allow anyone to insert (public submission form)
CREATE POLICY "Anyone can submit questionnaires"
  ON public.restaurant_questionnaires
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only allow reading questionnaires for published restaurants
CREATE POLICY "Anyone can view questionnaires for published restaurants"
  ON public.restaurant_questionnaires
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = restaurant_questionnaires.restaurant_id
      AND restaurants.status = 'Published'
    )
  );

-- Only service role can update/delete
CREATE POLICY "Service role can update questionnaires"
  ON public.restaurant_questionnaires
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete questionnaires"
  ON public.restaurant_questionnaires
  FOR DELETE
  TO service_role
  USING (true);

-- RLS Policies for restaurant_ratings table
-- Only service role can insert ratings (admin only)
CREATE POLICY "Service role can add ratings"
  ON public.restaurant_ratings
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only allow reading ratings for published restaurants
CREATE POLICY "Anyone can view ratings for published restaurants"
  ON public.restaurant_ratings
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = restaurant_ratings.restaurant_id
      AND restaurants.status = 'Published'
    )
  );

-- Only service role can update/delete
CREATE POLICY "Service role can update ratings"
  ON public.restaurant_ratings
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete ratings"
  ON public.restaurant_ratings
  FOR DELETE
  TO service_role
  USING (true);

-- RLS Policies for restaurant_publications table
-- Only service role can insert/update/delete publications (admin only)
CREATE POLICY "Service role can manage publications"
  ON public.restaurant_publications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anyone can read publications
CREATE POLICY "Anyone can view publications"
  ON public.restaurant_publications
  FOR SELECT
  TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_restaurants_status ON public.restaurants(status);
CREATE INDEX idx_restaurants_submitted_at ON public.restaurants(submitted_at DESC);
CREATE INDEX idx_restaurant_questionnaires_restaurant_id ON public.restaurant_questionnaires(restaurant_id);
CREATE INDEX idx_restaurant_ratings_restaurant_id ON public.restaurant_ratings(restaurant_id);
CREATE INDEX idx_restaurant_publications_restaurant_id ON public.restaurant_publications(restaurant_id);