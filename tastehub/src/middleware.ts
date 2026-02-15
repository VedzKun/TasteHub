import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup');

  const isProtectedPage =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/calendar') ||
    request.nextUrl.pathname.startsWith('/generate-calendar') ||
    request.nextUrl.pathname.startsWith('/posts') ||
    request.nextUrl.pathname.startsWith('/add-post') ||
    request.nextUrl.pathname.startsWith('/analytics');

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to login if not logged in and trying to access protected pages
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/calendar/:path*',
    '/generate-calendar/:path*',
    '/posts/:path*',
    '/add-post/:path*',
    '/analytics/:path*',
    '/login',
    '/signup',
  ],
};
