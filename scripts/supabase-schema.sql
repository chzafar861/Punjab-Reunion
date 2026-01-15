-- Run this SQL in Supabase SQL Editor to create the tables
-- Go to: Supabase Dashboard > SQL Editor > New Query

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  full_name TEXT NOT NULL,
  village_name TEXT NOT NULL,
  district TEXT NOT NULL,
  year_left INTEGER,
  current_location TEXT,
  story TEXT NOT NULL,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile_comments table
CREATE TABLE IF NOT EXISTS profile_comments (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL,
  user_id VARCHAR,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  profile_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tour_inquiries table
CREATE TABLE IF NOT EXISTS tour_inquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  travel_dates TEXT,
  group_size INTEGER,
  interest_areas TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all profiles
CREATE POLICY "Allow public read access to profiles" ON profiles
  FOR SELECT USING (true);

-- Create policy to allow users to insert/update their own profiles
CREATE POLICY "Allow users to manage their own profiles" ON profiles
  FOR ALL USING (auth.uid()::text = user_id);

-- Create policy for public read of comments
CREATE POLICY "Allow public read access to comments" ON profile_comments
  FOR SELECT USING (true);

-- Create policy for users to manage their own comments
CREATE POLICY "Allow users to manage their own comments" ON profile_comments
  FOR ALL USING (auth.uid()::text = user_id);

-- Create policy for inserting inquiries (anyone can submit)
CREATE POLICY "Allow public to insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to insert tour inquiries" ON tour_inquiries
  FOR INSERT WITH CHECK (true);
