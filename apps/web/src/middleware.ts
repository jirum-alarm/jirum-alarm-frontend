// middleware.js
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const ph_project_api_key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const ph_cookie_key = `ph_${ph_project_api_key}_posthog`;
  const cookie = request.cookies.get(ph_cookie_key);

  let distinct_id;
  if (cookie) {
    distinct_id = JSON.parse(cookie.value).distinct_id;
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

  const bootstrapData = {
    distinctID: distinct_id,
    featureFlags: data.featureFlags,
  };

  const response = NextResponse.next();
  response.cookies.set('bootstrapData', JSON.stringify(bootstrapData));

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico|vercel.svg|next.svg).*)'],
};
