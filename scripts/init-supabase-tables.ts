import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createTableSQL = `
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
`;

async function initTables() {
  console.log('Creating tables in Supabase...\n');
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Service Key (first 20 chars):', supabaseServiceKey?.substring(0, 20) + '...');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
  
  if (error) {
    console.log('\nNote: Direct SQL execution via RPC is not available.');
    console.log('Attempting to create tables by inserting test data...\n');
    
    const testResults = await Promise.all([
      testOrCreateTable('profiles'),
      testOrCreateTable('inquiries'),
      testOrCreateTable('tour_inquiries'),
      testOrCreateTable('profile_comments'),
    ]);
    
    console.log('\n=== Table Status ===');
    testResults.forEach(r => console.log(`${r.table}: ${r.status}`));
    
    if (testResults.some(r => r.status === 'NOT_FOUND')) {
      console.log('\n-------------------------------------------');
      console.log('Some tables do not exist. You need to create them manually.');
      console.log('Please copy the SQL below and run it in Supabase SQL Editor:');
      console.log('-------------------------------------------\n');
      console.log(createTableSQL);
    }
  } else {
    console.log('Tables created successfully!');
  }
  
  process.exit(0);
}

async function testOrCreateTable(tableName: string): Promise<{ table: string; status: string }> {
  const { data, error } = await supabase.from(tableName).select('id').limit(1);
  
  if (error) {
    if (error.message.includes('does not exist') || error.code === '42P01') {
      return { table: tableName, status: 'NOT_FOUND' };
    }
    return { table: tableName, status: `ERROR: ${error.message}` };
  }
  
  return { table: tableName, status: 'EXISTS' };
}

initTables();
