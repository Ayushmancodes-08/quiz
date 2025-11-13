import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { cleanupAbandonedAttempts } from '@/lib/cleanup-utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin (you may need to adjust this based on your auth setup)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const gracePeriodHours = body.gracePeriodHours || 24;
    const dryRun = body.dryRun || false;
    
    // Perform cleanup
    const result = await cleanupAbandonedAttempts(gracePeriodHours, dryRun);
    
    // Log the operation if not a dry run
    if (!dryRun) {
      await supabase.rpc('log_cleanup_operation', {
        p_performed_by: user.id,
        p_operation_type: 'abandoned_attempts_cleanup',
        p_records_affected: result.attemptsCleaned,
        p_config: { gracePeriodHours },
        p_result: { details: result.details }
      });
    }
    
    return NextResponse.json({
      success: true,
      attemptsCleaned: result.attemptsCleaned,
      recordsDeleted: result.attemptsCleaned,
      details: result.details,
      dryRun
    });
    
  } catch (error: any) {
    console.error('Error cleaning up abandoned attempts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup abandoned attempts' },
      { status: 500 }
    );
  }
}
