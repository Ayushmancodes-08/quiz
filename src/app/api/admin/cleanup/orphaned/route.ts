import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { deleteOrphanedRecords, getCleanupStatistics } from '@/lib/cleanup-utils';

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
    const dryRun = body.dryRun || false;
    
    if (dryRun) {
      // Just return statistics
      const stats = await getCleanupStatistics();
      return NextResponse.json({
        success: true,
        orphanedShuffledQuestions: stats.orphanedShuffledQuestions,
        orphanedStudentAnswers: stats.orphanedStudentAnswers,
        totalOrphaned: stats.orphanedShuffledQuestions + stats.orphanedStudentAnswers,
        dryRun: true
      });
    }
    
    // Perform cleanup
    const result = await deleteOrphanedRecords();
    
    // Log the operation
    await supabase.rpc('log_cleanup_operation', {
      p_performed_by: user.id,
      p_operation_type: 'orphaned_records_cleanup',
      p_records_affected: result.shuffledQuestionsDeleted + result.studentAnswersDeleted,
      p_config: {},
      p_result: result
    });
    
    return NextResponse.json({
      success: true,
      shuffledQuestionsDeleted: result.shuffledQuestionsDeleted,
      studentAnswersDeleted: result.studentAnswersDeleted,
      totalDeleted: result.shuffledQuestionsDeleted + result.studentAnswersDeleted
    });
    
  } catch (error: any) {
    console.error('Error cleaning up orphaned records:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup orphaned records' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
    
    // Get cleanup statistics
    const stats = await getCleanupStatistics();
    
    return NextResponse.json({
      success: true,
      statistics: stats
    });
    
  } catch (error: any) {
    console.error('Error getting cleanup statistics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get cleanup statistics' },
      { status: 500 }
    );
  }
}
