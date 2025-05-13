import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import { GRAPHQL_ENDPOINT } from '@/constants/graphql';
import { accessTokenExpiresAt, refreshTokenExpiresAt } from '@/constants/token';
import { graphql } from '@/shared/api/gql';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken =
    req.cookies.get('ACCESS_TOKEN')?.value || cookieStore.get('ACCESS_TOKEN')?.value;

  const { query, variables } = await req.json();

  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
    const data = await res.json();
    if (data.errors && data.errors.length) {
      for (const error of data.errors) {
        switch (error.extensions.code) {
          case 'FORBIDDEN':
          case 'UNAUTHENTICATED': {
            const refreshToken =
              req.cookies.get('REFRESH_TOKEN')?.value || cookieStore.get('REFRESH_TOKEN')?.value;

            if (refreshToken) {
              const tokenResponse = await fetch(GRAPHQL_ENDPOINT, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  authorization: refreshToken ? `Bearer ${refreshToken}` : '',
                },
                body: JSON.stringify({
                  query: MutationLoginByRefreshToken,
                }),
              });

              if (!tokenResponse.ok) {
                return NextResponse.json({ message: 'Failed to refresh token' }, { status: 401 });
              }

              const { data: tokenData } = (await tokenResponse.json()) as {
                data: {
                  loginByRefreshToken: {
                    accessToken: string;
                    refreshToken: string;
                  };
                };
              };

              const newAccessToken = tokenData.loginByRefreshToken.accessToken;
              const newRefreshToken = tokenData.loginByRefreshToken.refreshToken;

              const newRes = await fetch(GRAPHQL_ENDPOINT, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(newAccessToken ? { Authorization: `Bearer ${newAccessToken}` } : {}),
                },
                body: JSON.stringify({ query, variables }),
              });

              const newData = await newRes.json();
              if (newData.errors && newData.errors.length) {
                return NextResponse.json({ message: 'Failed to refresh token' }, { status: 401 });
              }

              const response = NextResponse.json(newData);
              response.cookies.set('ACCESS_TOKEN', newAccessToken, {
                expires: Date.now() + accessTokenExpiresAt,
                httpOnly: false,
              });
              response.cookies.set('REFRESH_TOKEN', newRefreshToken, {
                expires: Date.now() + refreshTokenExpiresAt,
                httpOnly: true,
              });
              return response;
            }
          }
        }
      }
      return NextResponse.json({ message: 'Failed to refresh token' }, { status: 401 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to refresh token' }, { status: 401 });
  }
}
const MutationLoginByRefreshToken = graphql(`
  mutation QueryLoginByRefreshToken {
    loginByRefreshToken {
      accessToken
      refreshToken
    }
  }
`);
