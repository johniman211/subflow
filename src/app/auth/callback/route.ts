import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { notifyAdminNewSignup } from '@/lib/platform-notifications';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    // Check if this is a new user (created within last 5 minutes)
    if (data?.user) {
      const createdAt = new Date(data.user.created_at);
      const now = new Date();
      const isNewUser = (now.getTime() - createdAt.getTime()) < 5 * 60 * 1000;

      if (isNewUser) {
        try {
          // Get user profile for business name
          const { data: profile } = await supabase
            .from('users')
            .select('business_name, full_name')
            .eq('id', data.user.id)
            .single();

          await notifyAdminNewSignup({
            userEmail: data.user.email || '',
            userName: (profile as any)?.full_name,
            businessName: (profile as any)?.business_name,
          });
        } catch (notifyError) {
          console.error('Signup notification error:', notifyError);
        }
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
