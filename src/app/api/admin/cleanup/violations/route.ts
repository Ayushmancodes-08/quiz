import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { archiveOldViolations, deleteArchivedViolations } from '@/lib/cleanup-utils';

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
    
    // Check if user is admin
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
    const retentionDays = body.retentionDays || 90;
    const archiveBeforeDelete = body.archiveBeforeDelete !== false;
    const dryRun = body.dryRun || false;
    
    let violationsArchived = 0;
    let violationsDeleted = 0;
    
    if (!dryRun) {
      if (archiveBeforeDelete) {
        violationsArchived = await archiveOldViolations(retentionDays);
      }
      
      // Delete very old archived violations (1 year+)
      violationsDeleted = await deleteArchivedViolations(365);
      
      // Log the operation
      await supabase.rpc('log_cleanup_operation', {
        p_performed_by: user.id,
        p_operation_type: 'violations_cleanup',
        p_records_affected: violationsArchived + violationsDeleted,
        p_config: { retentionDays, archiveBeforeDelete },
        p_result: { violationsArchived, violationsDeleted }
      });
    } else {
      // For dry run, just count the violations
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const { count } = await supabase
        .from('security_violations')
        .select('*', { count: 'exact', head: true })
        .lt('timestamp', cutoffDate.toISOString());
      
      violationsArchived = count || 0;
    }
    
    return NextResponse.json({
      success: true,
      violationsArchived,
      violationsDeleted,
      oldestRetained: new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000),
      dryRun
    });
    
  } catch (error: any) {
    console.error('Error cleaning up violations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup violations' },
      { status: 500 }
    );
  }
}
