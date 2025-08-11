import { NextRequest } from 'next/server';

import { GRAPHQL_ENDPOINT } from '@/constants/graphql';
import { accessTokenExpiresAt, refreshTokenExpiresAt } from '@/constants/token';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const upstream = GRAPHQL_ENDPOINT;
  if (!upstream) {
    return new Response(JSON.stringify({ errors: [{ message: 'API URL not configured' }] }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const body = await req.json();

  const accessToken = req.cookies.get('ACCESS_TOKEN')?.value;
  const incomingAuth = req.headers.get('Authorization');

  const auth = incomingAuth ?? `Bearer ${accessToken}`;

  let res = await fetch(upstream, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/graphql-response+json',
      Authorization: auth || '',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  // If UNAUTHENTICATED/FORBIDDEN and refresh token exists, try to refresh and retry once
  try {
    const cloned = res.clone();
    const json = (await cloned.json().catch(() => null)) as any;
    const hasAuthError = Array.isArray(json?.errors)
      ? json.errors.some((e: any) => ['UNAUTHENTICATED', 'FORBIDDEN'].includes(e?.extensions?.code))
      : false;
    const refreshToken = req.cookies.get('REFRESH_TOKEN')?.value;

    if (hasAuthError && refreshToken) {
      const refreshRes = await fetch(upstream, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/graphql-response+json',
          Authorization: `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({
          query: `mutation QueryLoginByRefreshToken { loginByRefreshToken { accessToken refreshToken } }`,
        }),
        cache: 'no-store',
      });
      const refreshJson = (await refreshRes.json().catch(() => null)) as any;
      const tokens = refreshJson?.data?.loginByRefreshToken;
      if (tokens?.accessToken) {
        const headers = new Headers();
        // propagate content headers
        res.headers.forEach((value, key) => {
          if (['content-type', 'cache-control'].includes(key.toLowerCase())) {
            headers.set(key, value);
          }
        });
        // set cookies
        const isProd = process.env.NODE_ENV === 'production';
        const cookieParts = (name: string, value: string, ms: number, httpOnly = true) =>
          [
            `${name}=${value}`,
            'Path=/',
            `Expires=${new Date(Date.now() + ms).toUTCString()}`,
            httpOnly ? 'HttpOnly' : '',
            'SameSite=Lax',
            isProd ? 'Secure' : '',
          ]
            .filter(Boolean)
            .join('; ');

        headers.append(
          'Set-Cookie',
          cookieParts('ACCESS_TOKEN', tokens.accessToken, accessTokenExpiresAt, true),
        );
        if (tokens.refreshToken) {
          headers.append(
            'Set-Cookie',
            cookieParts('REFRESH_TOKEN', tokens.refreshToken, refreshTokenExpiresAt, true),
          );
        }

        // retry original request with new access token
        res = await fetch(upstream, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/graphql-response+json',
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          body: JSON.stringify(body),
          cache: 'no-store',
        });

        return new Response(res.body, { status: res.status, headers });
      }
    }
  } catch {
    // ignore refresh flow errors, fall through to original response
  }

  // Pass-through status and headers relevant to GraphQL response
  const responseHeaders = new Headers();
  res.headers.forEach((value, key) => {
    if (['content-type', 'cache-control'].includes(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new Response(res.body, { status: res.status, headers: responseHeaders });
}
