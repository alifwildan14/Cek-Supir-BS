// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true'; // Sesuaikan jika Anda menggunakan session/cookie nyata
  const path = request.nextUrl.pathname;

  // Jika mencoba mengakses /admin tanpa autentikasi, redirect ke login
  if (path.startsWith('/admin') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah login dan mencoba mengakses /login, redirect ke /admin
  if (path.startsWith('/login') && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'], // Terapkan middleware pada rute admin dan login
};