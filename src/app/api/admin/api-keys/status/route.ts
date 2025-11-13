import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { getApiKeyManager } from '@/lib/api-key-manager';

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
    
    // Get API key manager status
    const manager = getApiKeyManager();
    const status = manager.getStatus();
    const totalKeys = manager.getTotalKeys();
    const availableKeys = manager.getAvailableKeysCount();
    
    return NextResponse.json({
      success: true,
      totalKeys,
      availableKeys,
      unavailableKeys: totalKeys - availableKeys,
      keys: status
    });
    
  } catch (error: any) {
    console.error('Error getting API key status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get API key status' },
      { status: 500 }
    );
  }
}
