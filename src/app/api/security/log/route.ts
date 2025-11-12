import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { securityLogger } from '@/lib/security-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, timestamp, userAgent, url, sessionId } = body;

    // Beautiful API logging
    securityLogger.api('POST', '/api/security/log', {
      'Violation Type': type,
      'Session ID': sessionId?.substring(0, 8),
      'URL': url,
      'Timestamp': new Date(timestamp).toLocaleString(),
    });

    try {
      const supabase = await createClient();
      
      // Get current user (optional - works without auth)
      const { data: { user } } = await supabase.auth.getUser();

      // Try to log security violation to database
      const { error } = await supabase
        .from('security_logs')
        .insert({
          user_id: user?.id || null,
          violation_type: type,
          timestamp: timestamp,
          user_agent: userAgent,
          url: url,
          session_id: sessionId,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        });

      if (error) {
        securityLogger.debug('Database logging skipped', {
          reason: error.message,
          note: 'Table may not exist yet - run migration'
        });
        // Don't fail the request - just log to console
      } else {
        securityLogger.success('Violation logged to database');
        // Check if user has too many violations
        if (user) {
          const { data: recentViolations } = await supabase
            .from('security_logs')
            .select('id')
            .eq('user_id', user.id)
            .gte('timestamp', new Date(Date.now() - 3600000).toISOString()); // Last hour

          if (recentViolations && recentViolations.length > 10) {
            // Too many violations - could trigger account suspension
            return NextResponse.json({ 
              warning: 'Too many security violations',
              action: 'account_review_required'
            }, { status: 429 });
          }
        }
      }
    } catch (dbError) {
      securityLogger.debug('Database connection failed', {
        note: 'Supabase may not be configured',
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      });
      // Continue - violation is still logged to console
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    securityLogger.debug('Security log error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
