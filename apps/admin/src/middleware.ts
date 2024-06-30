import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAccessToken } from './app/actions/token';

const unProtectedRoutes = ['/auth/signin'];

export default async function AuthMiddleware(request: NextRequest): Promise<NextResponse> {
  const { origin, pathname } = request.nextUrl;
  const isUnProtectedPath = unProtectedRoutes.some((path) => pathname.startsWith(path));
  const accessToken = await getAccessToken();

  if (!isUnProtectedPath && !accessToken) {
    return NextResponse.redirect(`${origin}/auth/signin`);
  }

  if (isUnProtectedPath && accessToken) {
    return NextResponse.redirect(origin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
