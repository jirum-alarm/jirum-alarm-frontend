// middleware.js
import { NextRequest, NextResponse } from 'next/server';
import { ResponseCookies, RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

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

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const ph_project_api_key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const ph_cookie_key = `ph_${ph_project_api_key}_posthog`;
  const cookie = request.cookies.get(ph_cookie_key);

  let distinct_id;
  if (cookie) {
    distinct_id = JSON.parse(cookie?.value).distinct_id;
  } else {
    distinct_id = crypto.randomUUID();
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: ph_project_api_key,
      distinct_id: distinct_id,
    }),
  };

  const ph_request = await fetch(
    `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/decide?v=3`,
    requestOptions,
  );

  const data = await ph_request.json();

  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  const bootstrapData = {
    distinctID: distinct_id,
    featureFlags: data.featureFlags,
  };

  const cookieInfo = {
    name: 'bootstrapData',
    value: JSON.stringify(bootstrapData),
  };

  response.cookies.set(cookieInfo);
  applySetCookie(request, response);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico|vercel.svg|next.svg).*)'],
};
