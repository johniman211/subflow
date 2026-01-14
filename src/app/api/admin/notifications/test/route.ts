import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    
    // Get admin user
    const authHeader = request.headers.get('cookie');
    // For simplicity, we'll just check if the provider exists
    
    const { provider_id } = await request.json();

    if (!provider_id) {
      return NextResponse.json({ error: 'provider_id is required' }, { status: 400 });
    }

    // Get provider
    const { data: provider, error } = await supabase
      .from('notification_providers')
      .select('*')
      .eq('id', provider_id)
      .single();

    if (error || !provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Get admin email for test
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@payssd.com';
    const adminPhone = process.env.ADMIN_PHONE || '+211912345678';

    // Create notification service and test
    const service = new NotificationService();
    
    const testPayload = {
      event_type: 'platform.alert' as const,
      recipient_type: 'admin' as const,
      recipient_email: adminEmail,
      recipient_phone: adminPhone,
      channels: [provider.channel as 'email' | 'sms' | 'whatsapp'],
      data: {
        message: `This is a test notification from Payssd. Provider: ${provider.name}. Time: ${new Date().toISOString()}`,
      },
    };

    const result = await service.send(testPayload);

    return NextResponse.json({
      success: result.success,
      results: result.results,
    });
  } catch (error: any) {
    console.error('Test notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
