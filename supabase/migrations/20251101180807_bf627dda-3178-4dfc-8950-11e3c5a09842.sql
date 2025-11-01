-- Create a table for dynamic metrics
CREATE TABLE IF NOT EXISTS public.site_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurants_tracked integer NOT NULL DEFAULT 0,
  families_joined integer NOT NULL DEFAULT 0,
  policy_updates_tracked integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_metrics ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read metrics
CREATE POLICY "Metrics are viewable by everyone"
  ON public.site_metrics
  FOR SELECT
  USING (true);

-- Only admins can update metrics
CREATE POLICY "Admins can update metrics"
  ON public.site_metrics
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert metrics
CREATE POLICY "Admins can insert metrics"
  ON public.site_metrics
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial values
INSERT INTO public.site_metrics (restaurants_tracked, families_joined, policy_updates_tracked)
VALUES (150, 2500, 45)
ON CONFLICT DO NOTHING;