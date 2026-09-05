import { RequestCookies, ResponseCookies } from 'next/dist/server/web/spec-extension/cookies';
import { NextRequest, NextResponse } from 'next/server';

import { graphql } from '@/shared/api/gql';
import { decideAuthAction, isProtectedPath } from '@/shared/config/auth-route';
import { IS_INDEXABLE_DEPLOYMENT, IS_PRD } from '@/shared/config/env';
import { GRAPHQL_ENDPOINT } from '@/shared/config/graphql';
import { PAGE } from '@/shared/config/page';
import {
  accessTokenExpiresAt,
  AUTH_COOKIE_DOMAIN,
  refreshTokenExpiresAt,
} from '@/shared/config/token';

const DEVICE_ID_COOKIE = 'jirum-alarm-device-id';
const DEVICE_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const ensureDeviceId = (req: NextRequest, res: NextResponse): void => {
  if (req.cookies.get(DEVICE_ID_COOKIE)?.value) {
    return;
  }
  const deviceId = crypto.randomUUID();
  res.cookies.set({
    name: DEVICE_ID_COOKIE,
    value: deviceId,
    path: '/',
    maxAge: DEVICE_ID_MAX_AGE_SECONDS,
    sameSite: 'lax',
    secure: IS_PRD,
  });
  applySetCookie(req, res);
};

/**
 * 서버 컴포넌트는 요청 경로를 알 수 없다(headers()만 있고 pathname 은 없음).
 * root layout 이 첫 페인트에 바텀네비 여백을 미리 잡으려면 경로가 필요해서
 * 여기서 헤더로 심어 넘긴다.
 */
export const PATHNAME_HEADER = 'x-jirum-pathname';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // const response = await handlePostHog(request);

  // ⚠️ request.headers 자체에 심는다. applySetCookie 가 req.headers 를 원본으로
  // 새 override 를 만들어 통째로 덮어쓰기 때문에, NextResponse.next({request:{headers}})
  // 로만 넘기면 토큰 리프레시 경로에서 이 헤더가 조용히 사라진다.
  request.headers.set(PATHNAME_HEADER, request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });
  ensureDeviceId(request, response);
  // ⚠️ robots.txt 로 막지 않는다. Disallow 하면 크롤러가 페이지를 못 읽어서 noindex 도 못 보고,
  // 이미 색인된 dev URL 이 영구히 남는다. 색인에서 빼려면 "크롤 허용 + noindex" 가 정답.
  if (!IS_INDEXABLE_DEPLOYMENT) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return await routeGuard(request, response);
}

const routeGuard = async (req: NextRequest, res: NextResponse) => {
  const action = decideAuthAction({
    pathname: req.nextUrl.pathname,
    hasAccessToken: Boolean(req.cookies.get('ACCESS_TOKEN')?.value),
    hasRefreshToken: Boolean(req.cookies.get('REFRESH_TOKEN')?.value),
  });

  if (action === 'redirect') {
    return NextResponse.redirect(new URL(PAGE.LOGIN, req.url));
  }

  if (action === 'refresh') {
    const { status } = await refreshToken(req, res);
    if (status === 'invalid' && isProtectedPath(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL(PAGE.LOGIN, req.url));
    }
  }

  return res;
};

// const handlePostHog = async (request: NextRequest) => {
//   const ph_project_api_key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
//   const ph_cookie_key = `ph_${ph_project_api_key}_posthog`;
//   const cookie = request.cookies.get(ph_cookie_key);

//   let distinct_id;
//   if (cookie) {
//     distinct_id = JSON.parse(cookie.value).distinct_id;
//   } else {
//     distinct_id = crypto.randomUUID();
//   }

//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       api_key: ph_project_api_key,
//       distinct_id: distinct_id,
//     }),
//   };

//   const ph_request = await fetch(
//     `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/decide?v=3`,
//     requestOptions,
//   );

//   const data = await ph_request.json();

//   const response = NextResponse.next({
//     request: {
//       headers: new Headers(request.headers),
//     },
//   });

//   const bootstrapData = {
//     distinctID: distinct_id,
//     featureFlags: data.featureFlags,
//   };

//   const cookieInfo = {
//     name: 'bootstrapData',
//     value: JSON.stringify(bootstrapData),
//   };

//   response.cookies.set(cookieInfo);
//   applySetCookie(request, response);

//   return response;
// };

const getNewToken = async (refreshToken?: string) => {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: refreshToken ? `Bearer ${refreshToken}` : '',
    },
    body: JSON.stringify({
      query: MutationLoginByRefreshToken,
    }),
  });
  return await response.json();
};

const refreshToken = async (
  req: NextRequest,
  res: NextResponse,
): Promise<{ status: 'invalid' | 'valid' }> => {
  const currentRefreshToken = req.cookies.get('REFRESH_TOKEN')?.value;

  const result = await getNewToken(currentRefreshToken).catch(() => null);
  const tokens = result?.data?.loginByRefreshToken;

  // accessToken 이 없으면 갱신 실패. 기존 쿠키는 절대 건드리지 않는다 —
  // 예전 코드는 `result.data` 만 보고 구조분해했다가 refreshToken:undefined 로
  // 멀쩡한 리프레시 토큰을 덮어써서 완전 로그아웃을 만들었다.
  if (!tokens?.accessToken) {
    return { status: 'invalid' };
  }

  // ⚠️ domain 은 여기도 반드시 — 빠지면 갱신 시 host-only 로 되돌아가서
  // 1시간 뒤 ai 서브도메인 로그인만 조용히 풀린다.
  res.cookies.set({
    name: 'ACCESS_TOKEN',
    expires: new Date(Date.now() + accessTokenExpiresAt),
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: IS_PRD,
    domain: AUTH_COOKIE_DOMAIN,
    value: tokens.accessToken,
  });

  // 백엔드는 슬라이딩 갱신이 필요할 때만 refreshToken 을 함께 준다(auth.service.ts
  // loginByRefreshToken). 없을 때 세팅하면 유효한 토큰을 지우는 셈이라 반드시 가드.
  if (tokens.refreshToken) {
    res.cookies.set({
      name: 'REFRESH_TOKEN',
      expires: new Date(Date.now() + refreshTokenExpiresAt),
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: IS_PRD,
      domain: AUTH_COOKIE_DOMAIN,
      value: tokens.refreshToken,
    });
  }

  applySetCookie(req, res);
  return { status: 'valid' };
};

/**
 * Copy cookies from the Set-Cookie header of the response to the Cookie header of the request,
 * so that it will appear to SSR/RSC as if the user already has the new cookies.
 */
function applySetCookie(req: NextRequest, res: NextResponse): void {
  // parse the outgoing Set-Cookie header
  const setCookies = new ResponseCookies(res.headers);
  // Build a new Cookie header for the request by adding the setCookies
  const newReqHeaders = new Headers(req.headers);
  const newReqCookies = new RequestCookies(newReqHeaders);
  setCookies.getAll().forEach((cookie) => newReqCookies.set(cookie));
  // set “request header overrides” on the outgoing response
  NextResponse.next({
    request: { headers: newReqHeaders },
  }).headers.forEach((value, key) => {
    if (key === 'x-middleware-override-headers' || key.startsWith('x-middleware-request-')) {
      res.headers.set(key, value);
    }
  });
}

const MutationLoginByRefreshToken = graphql(`
  mutation QueryLoginByRefreshToken {
    loginByRefreshToken {
      accessToken
      refreshToken
    }
  }
`);

// _next 전체와 정적 파일을 제외한다. 갱신이 전 경로로 넓어졌으므로(decideAuthAction),
// _next/image 같은 서브리소스가 매처에 걸리면 한 페이지에서 이미지 수만큼 refresh 가
// 동시에 터진다. 예전엔 3개 경로에서만 갱신해서 드러나지 않았던 함정.
export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)'],
};
