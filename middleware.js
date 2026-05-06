import { NextResponse } from 'next/server';

// Simple locale middleware: reads NEXT_LOCALE cookie and sets it.
// Does NOT redirect or rewrite URLs — keeps all existing routes intact.
export function middleware(request) {
  const response = NextResponse.next();
  
  // If no locale cookie is set, default to 'fr'
  const localeCookie = request.cookies.get('NEXT_LOCALE');
  if (!localeCookie) {
    response.cookies.set('NEXT_LOCALE', 'fr', {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax'
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except api, _next, static files and icons
    '/((?!api|_next/static|_next/image|favicon.ico|icons|logo.png).*)'
  ]
};
