import { RequestCookies, ResponseCookies } from 'next/dist/server/web/spec-extension/cookies';
import { NextRequest, NextResponse } from 'next/server';

import { graphql } from '@/shared/api/gql';
import { IS_PRD } from '@/shared/config/env';
import { GRAPHQL_ENDPOINT } from '@/shared/config/graphql';
import { PAGE } from '@/shared/config/page';
import { accessTokenExpiresAt, refreshTokenExpiresAt } from '@/shared/config/token';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // const response = await handlePostHog(request);
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });
  return await routeGuard(request, response);
}

const protectedPaths = [PAGE.MYPAGE, PAGE.LIKE];
const onlyRefreshTokenPaths = [PAGE.TRENDING];

const routeGuard = async (req: NextRequest, res: NextResponse) => {
  const { pathname } = req.nextUrl;

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isOnlyRefreshTokenPaths = onlyRefreshTokenPaths.some((path) => pathname.startsWith(path));

  if (isProtectedPath) {
    const { status } = await refreshAndVerifyToken(req, res);
    if (status === 'valid') {
      return res;
    }
    if (status === 'invalid') {
      return NextResponse.redirect(new URL(PAGE.LOGIN, req.url));
    }
  }

  if (isOnlyRefreshTokenPaths) {
    const { status } = await refreshAndVerifyToken(req, res);
    if (status === 'valid') {
      return res;
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

const tokenVerify = async (accessToken?: string) => {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
    body: JSON.stringify({
      query: QueryMe,
    }),
  });
  return await response.json();
};

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

const refreshAndVerifyToken = async (
  req: NextRequest,
  res: NextResponse,
): Promise<{ status: 'invalid' | 'valid' }> => {
  const accessToken = req.cookies.get('ACCESS_TOKEN')?.value;
  const refreshToken = req.cookies.get('REFRESH_TOKEN')?.value;

  const result = await tokenVerify(accessToken);
  if (!result.data?.me) {
    if (!refreshToken) {
      return { status: 'invalid' };
    }
    const result = await getNewToken(refreshToken);
    if (result.data) {
      const { accessToken, refreshToken } = result.data.loginByRefreshToken;
      const access_token = {
        name: 'ACCESS_TOKEN',
        expires: new Date(Date.now() + accessTokenExpiresAt),
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: IS_PRD,
        value: accessToken,
      };
      const refresh_token = {
        name: 'REFRESH_TOKEN',
        expires: new Date(Date.now() + refreshTokenExpiresAt),
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: IS_PRD,
        value: refreshToken,
      };
      res.cookies.set(access_token);
      res.cookies.set(refresh_token);
      applySetCookie(req, res);
    }
    if (result.errors) {
      return { status: 'invalid' };
    }
  }
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

const QueryMe = graphql(`
  query QueryMe {
    me {
      id
      email
      nickname
      birthYear
      gender
      favoriteCategories
    }
  }
`);

const MutationLoginByRefreshToken = graphql(`
  mutation QueryLoginByRefreshToken {
    loginByRefreshToken {
      accessToken
      refreshToken
    }
  }
`);

//'/mypage/:path*',
export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico|vercel.svg|next.svg).*)'],
};
