import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request);
  
  const { pathname } = request.nextUrl;
  
  // Add pathname header for server components to access
  response.headers.set('x-pathname', pathname);
  
  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    // Session will be validated by Supabase middleware
    // Additional checks can be added here
  }

  // Guard /creator/* routes (except /creator/onboard)
  if (pathname.startsWith('/creator') && pathname !== '/creator/onboard') {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Not logged in - redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is a creator (check both is_creator flag AND existing creator profile for backward compatibility)
    const { data: profile } = await supabase
      .from('users')
      .select('is_creator')
      .eq('id', session.user.id)
      .single();

    // Also check if user has an existing creator profile (for users created before is_creator flag)
    const { data: creatorProfile } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    const isCreator = profile?.is_creator === true || creatorProfile !== null;

    if (!isCreator) {
      // Not a creator - redirect to onboard
      return NextResponse.redirect(new URL('/creator/onboard', request.url));
    }

    // If user has creator profile but is_creator flag not set, update it
    if (creatorProfile && !profile?.is_creator) {
      await supabase
        .from('users')
        .update({ is_creator: true })
        .eq('id', session.user.id);
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
