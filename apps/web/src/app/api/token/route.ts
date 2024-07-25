import { accessTokenExpiresAt, refreshTokenExpiresAt } from '@/constants/token';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  console.log('accessToken : ', accessToken);
  console.log('refreshToken : ', refreshToken);

  return new Response('set-cookie!', {
    status: 200,
    headers: {
      'Set-Cookie': [
        `ACCESS_TOKEN=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Date.now() + accessTokenExpiresAt}`,
        `REFRESH_TOKEN=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Date.now() + refreshTokenExpiresAt}`,
      ].join(', '),
    },
  });
}
