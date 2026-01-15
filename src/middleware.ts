import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only handle session refresh - let layouts handle auth/role checks
  const { response } = await updateSession(request);
  
  const { pathname } = request.nextUrl;
  
  // Add pathname header for server components to access
  response.headers.set('x-pathname', pathname);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
