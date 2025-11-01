-- Create news table for RSS feed articles
CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source text,
  summary text,
  url text NOT NULL,
  published_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read news
CREATE POLICY "News is viewable by everyone"
  ON public.news
  FOR SELECT
  USING (true);

-- Only admins can insert news
CREATE POLICY "Admins can insert news"
  ON public.news
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update news
CREATE POLICY "Admins can update news"
  ON public.news
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete news
CREATE POLICY "Admins can delete news"
  ON public.news
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_news_published_at ON public.news(published_at DESC);

-- Create subscribers table for email signups
CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe"
  ON public.subscribers
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view subscribers
CREATE POLICY "Admins can view subscribers"
  ON public.subscribers
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));