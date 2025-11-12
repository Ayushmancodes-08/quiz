/**
 * Quick Database Check Script
 * 
 * Run: npx tsx scripts/check-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('\nAdd these to your .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database...\n');
  console.log('URL:', supabaseUrl);
  console.log('');

  const tables = ['user_profiles', 'quizzes', 'quiz_attempts'];
  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table as any)
        .select('count')
        .limit(1);

      if (error) {
        if (error.message.includes('relation') || error.message.includes('does not exist') || error.code === 'PGRST116') {
          console.log(`❌ Table "${table}" - NOT FOUND`);
          console.log(`   Error: ${error.message}`);
          allTablesExist = false;
        } else {
          console.log(`⚠️  Table "${table}" - EXISTS (but query failed)`);
          console.log(`   Error: ${error.message}`);
        }
      } else {
        console.log(`✅ Table "${table}" - EXISTS`);
      }
    } catch (err: any) {
      console.log(`❌ Table "${table}" - ERROR`);
      console.log(`   ${err.message}`);
      allTablesExist = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  
  if (allTablesExist) {
    console.log('✅ SUCCESS! All tables exist.');
    console.log('\nYour database is set up correctly!');
  } else {
    console.log('❌ TABLES MISSING! Database not set up.');
    console.log('\n📋 TO FIX:');
    console.log('1. Open: https://supabase.com/dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Run: supabase/migrations/001_initial_schema.sql');
    console.log('4. Run: supabase/migrations/002_functions.sql');
    console.log('\n📖 See: README_FIRST.md or FIX_ERRORS_NOW.md');
  }
  
  console.log('='.repeat(60) + '\n');
}

checkDatabase().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
