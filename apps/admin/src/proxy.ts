import { NextResponse } from 'next/server';

import { refreshTokens, TOKEN_COOKIES } from './lib/authTokens';

import type { NextRequest } from 'next/server';

const unProtectedRoutes = ['/auth/signin'];

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { origin, pathname } = request.nextUrl;
  const isUnProtectedPath = unProtectedRoutes.some((path) => pathname.startsWith(path));
  let accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // access(1시간)가 만료돼 사라졌어도 refresh 가 있으면 여기서 이어 붙인다 — 예전엔 1시간 뒤 무조건 로그인 화면이었다
  let renewed: Awaited<ReturnType<typeof refreshTokens>> = null;
  if (!accessToken && refreshToken) {
    renewed = await refreshTokens(refreshToken).catch(() => null);
    accessToken = renewed?.accessToken;
  }

  let response: NextResponse;
  if (!isUnProtectedPath && !accessToken) {
    response = NextResponse.redirect(`${origin}/auth/signin`);
  } else if (isUnProtectedPath && accessToken) {
    response = NextResponse.redirect(origin);
  } else {
    // 서버 렌더는 토큰을 안 쓴다(apolloProvider) — 응답 쿠키만 심으면 브라우저 요청부터 새 토큰을 쓴다
    response = NextResponse.next();
  }

  if (renewed) {
    for (const [name, value, opts] of TOKEN_COOKIES(renewed))
      response.cookies.set(name, value, opts);
  }
  return response;
}

export const config = {
  matcher: [
    // api·정적 파일·PWA 파일(매니페스트·아이콘)은 로그인 없이 받아야 설치가 된다
    '/((?!api|_next|favicon.ico|manifest.webmanifest|icons/|apple-icon).*)',
  ],
};
