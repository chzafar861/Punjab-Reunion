import { createClient } from '@supabase/supabase-js';
import { db } from '../server/db';
import { profiles, inquiries, tourInquiries, profileComments } from '../shared/schema';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function pushToSupabase() {
  console.log('Starting data push to Supabase...\n');

  try {
    const allProfiles = await db.select().from(profiles);
    console.log(`Found ${allProfiles.length} profiles`);

    const allInquiries = await db.select().from(inquiries);
    console.log(`Found ${allInquiries.length} inquiries`);

    const allTourInquiries = await db.select().from(tourInquiries);
    console.log(`Found ${allTourInquiries.length} tour inquiries`);

    const allComments = await db.select().from(profileComments);
    console.log(`Found ${allComments.length} profile comments`);

    if (allProfiles.length > 0) {
      console.log('\nPushing profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .upsert(allProfiles.map(p => ({
          ...p,
          created_at: p.createdAt?.toISOString()
        })), { onConflict: 'id' });
      
      if (error) {
        console.error('Profiles error:', error.message);
      } else {
        console.log('Profiles pushed successfully!');
      }
    }

    if (allInquiries.length > 0) {
      console.log('\nPushing inquiries...');
      const { error } = await supabase
        .from('inquiries')
        .upsert(allInquiries.map(i => ({
          ...i,
          created_at: i.createdAt?.toISOString()
        })), { onConflict: 'id' });
      
      if (error) {
        console.error('Inquiries error:', error.message);
      } else {
        console.log('Inquiries pushed successfully!');
      }
    }

    if (allTourInquiries.length > 0) {
      console.log('\nPushing tour inquiries...');
      const { error } = await supabase
        .from('tour_inquiries')
        .upsert(allTourInquiries.map(t => ({
          ...t,
          created_at: t.createdAt?.toISOString()
        })), { onConflict: 'id' });
      
      if (error) {
        console.error('Tour inquiries error:', error.message);
      } else {
        console.log('Tour inquiries pushed successfully!');
      }
    }

    if (allComments.length > 0) {
      console.log('\nPushing profile comments...');
      const { error } = await supabase
        .from('profile_comments')
        .upsert(allComments.map(c => ({
          ...c,
          created_at: c.createdAt?.toISOString()
        })), { onConflict: 'id' });
      
      if (error) {
        console.error('Comments error:', error.message);
      } else {
        console.log('Comments pushed successfully!');
      }
    }

    console.log('\n=== Data push complete! ===');
  } catch (err) {
    console.error('Error:', err);
  }
  
  process.exit(0);
}

pushToSupabase();
