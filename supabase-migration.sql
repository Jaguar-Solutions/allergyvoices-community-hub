-- AllergyVoices Database Schema Migration
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published'))
);

-- restaurant_questionnaires table
CREATE TABLE restaurant_questionnaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- restaurant_ratings table
CREATE TABLE restaurant_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 0 AND rating <= 100),
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_by TEXT
);

-- restaurant_publications table (for public version)
CREATE TABLE restaurant_publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  published_data JSONB,
  published_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_submitted_at ON restaurants(submitted_at);
CREATE INDEX idx_restaurant_questionnaires_restaurant_id ON restaurant_questionnaires(restaurant_id);
CREATE INDEX idx_restaurant_ratings_restaurant_id ON restaurant_ratings(restaurant_id);
CREATE INDEX idx_restaurant_publications_restaurant_id ON restaurant_publications(restaurant_id);

-- Create a view for easy querying of restaurant data with ratings
CREATE VIEW restaurant_summary AS
SELECT 
  r.id,
  r.name,
  r.email,
  r.phone,
  r.city,
  r.state,
  r.status,
  r.submitted_at,
  COALESCE(AVG(rr.rating), 0) as average_rating,
  COUNT(rr.id) as rating_count,
  rq.responses as questionnaire_responses
FROM restaurants r
LEFT JOIN restaurant_ratings rr ON r.id = rr.restaurant_id
LEFT JOIN restaurant_questionnaires rq ON r.id = rq.restaurant_id
GROUP BY r.id, rq.responses;

-- Enable Row Level Security (RLS) for better security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_publications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to published restaurants
CREATE POLICY "Published restaurants are viewable by everyone" ON restaurants
  FOR SELECT USING (status = 'published');

CREATE POLICY "Published restaurant data is viewable by everyone" ON restaurant_publications
  FOR SELECT USING (true);

-- Create policies for admin access (you'll need to set up authentication)
-- For now, we'll allow all operations - you can restrict this later
CREATE POLICY "Allow all operations for restaurants" ON restaurants
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for questionnaires" ON restaurant_questionnaires
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for ratings" ON restaurant_ratings
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for publications" ON restaurant_publications
  FOR ALL USING (true);

-- Insert some sample data for testing
INSERT INTO restaurants (name, email, phone, city, state, status) VALUES
('Sample Restaurant 1', 'contact@sample1.com', '555-0001', 'Raleigh', 'NC', 'pending'),
('Sample Restaurant 2', 'contact@sample2.com', '555-0002', 'Durham', 'NC', 'approved'),
('Sample Restaurant 3', 'contact@sample3.com', '555-0003', 'Cary', 'NC', 'published');

-- Insert sample questionnaire data
INSERT INTO restaurant_questionnaires (restaurant_id, responses) 
SELECT 
  r.id,
  '{"has_allergen_menu": "Yes", "staff_training": "Yes", "equipment_cleaning": "Always", "score": 85, "grade": "Gold"}'::jsonb
FROM restaurants r 
WHERE r.name = 'Sample Restaurant 1';

-- Insert sample rating data
INSERT INTO restaurant_ratings (restaurant_id, rating, comments, reviewed_by)
SELECT 
  r.id,
  85,
  'Excellent allergy practices and staff training',
  'Admin User'
FROM restaurants r 
WHERE r.name = 'Sample Restaurant 1';
