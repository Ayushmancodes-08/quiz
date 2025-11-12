/**
 * Supabase Setup Verification Script
 * 
 * Run this script to verify your Supabase setup is correct:
 * npx tsx scripts/verify-supabase-setup.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/supabase/types';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const REQUIRED_TABLES = [
  'user_profiles',
  'quizzes',
  'quiz_attempts',
];

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const results: CheckResult[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'warning', message: string) {
  results.push({ name, status, message });
}

function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('SUPABASE SETUP VERIFICATION');
  console.log('='.repeat(60) + '\n');

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}\n`);
  });

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  console.log('='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed, ${warnings} warnings`);
  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    console.log('❌ Setup incomplete. Please fix the issues above.\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  Setup mostly complete, but check warnings above.\n');
    process.exit(0);
  } else {
    console.log('✅ Setup complete! You\'re ready to go!\n');
    process.exit(0);
  }
}

async function verifySetup() {
  console.log('Verifying Supabase setup...\n');

  // Check 1: Environment Variables
  console.log('Checking environment variables...');
  let allEnvVarsPresent = true;
  
  for (const envVar of REQUIRED_ENV_VARS) {
    if (process.env[envVar]) {
      addResult(
        `Environment Variable: ${envVar}`,
        'pass',
        'Present and configured'
      );
    } else {
      addResult(
        `Environment Variable: ${envVar}`,
        'fail',
        'Missing! Add this to your .env.local file'
      );
      allEnvVarsPresent = false;
    }
  }

  if (!allEnvVarsPresent) {
    printResults();
    return;
  }

  // Check 2: Supabase Connection
  console.log('Testing Supabase connection...');
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        addResult(
          'Database Connection',
          'fail',
          'Connected, but tables not found. Run migrations in SQL Editor!'
        );
      } else {
        addResult(
          'Database Connection',
          'fail',
          `Connection error: ${error.message}`
        );
      }
    } else {
      addResult(
        'Database Connection',
        'pass',
        'Successfully connected to Supabase'
      );
    }
  } catch (err: any) {
    addResult(
      'Database Connection',
      'fail',
      `Failed to connect: ${err.message}`
    );
    printResults();
    return;
  }

  // Check 3: Tables Exist
  console.log('Checking database tables...');
  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await supabase.from(table as any).select('count').limit(1);
      
      if (error) {
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          addResult(
            `Table: ${table}`,
            'fail',
            'Table does not exist. Run migrations!'
          );
        } else {
          addResult(
            `Table: ${table}`,
            'warning',
            `Table exists but query failed: ${error.message}`
          );
        }
      } else {
        addResult(
          `Table: ${table}`,
          'pass',
          'Table exists and is accessible'
        );
      }
    } catch (err: any) {
      addResult(
        `Table: ${table}`,
        'fail',
        `Error checking table: ${err.message}`
      );
    }
  }

  // Check 4: RLS Policies
  console.log('Checking Row Level Security...');
  try {
    // Try to query without auth - should work for quizzes (public read)
    const { error: quizError } = await supabase.from('quizzes').select('id').limit(1);
    
    if (quizError && quizError.message.includes('permission')) {
      addResult(
        'RLS Policies',
        'fail',
        'RLS policies may not be configured correctly'
      );
    } else {
      addResult(
        'RLS Policies',
        'pass',
        'RLS policies appear to be working'
      );
    }
  } catch (err: any) {
    addResult(
      'RLS Policies',
      'warning',
      `Could not verify RLS: ${err.message}`
    );
  }

  // Check 5: Realtime
  console.log('Checking Realtime configuration...');
  addResult(
    'Realtime Configuration',
    'warning',
    'Cannot auto-verify. Enable in: Database → Replication → quizzes, quiz_attempts'
  );

  // Check 6: Auth Configuration
  console.log('Checking authentication...');
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      addResult(
        'Authentication',
        'warning',
        `Auth check returned error: ${error.message}`
      );
    } else {
      addResult(
        'Authentication',
        'pass',
        'Auth service is accessible'
      );
    }
  } catch (err: any) {
    addResult(
      'Authentication',
      'warning',
      `Could not verify auth: ${err.message}`
    );
  }

  printResults();
}

// Run verification
verifySetup().catch(err => {
  console.error('Verification script failed:', err);
  process.exit(1);
});
