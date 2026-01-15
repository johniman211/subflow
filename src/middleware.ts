import { updateSession } from '@/lib/supabase/middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
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
    const supabase = createMiddlewareClient({ req: request, res: response });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Not logged in - redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is a creator
    const { data: profile } = await supabase
      .from('users')
      .select('is_creator')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_creator) {
      // Not a creator - redirect to onboard
      return NextResponse.redirect(new URL('/creator/onboard', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
