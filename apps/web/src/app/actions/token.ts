'use server';

import { cookies, headers } from 'next/headers';

import { accessTokenExpiresAt, refreshTokenExpiresAt } from '@/constants/token';

async function setAccessToken(token: string) {
  (await cookies()).set('ACCESS_TOKEN', token, {
    expires: Date.now() + accessTokenExpiresAt,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

async function getAccessToken() {
  return (await cookies()).get('ACCESS_TOKEN')?.value;
}

async function getHeaderAuth() {
  return (await headers()).get('authorization');
}

async function removeAccessToken() {
  (await cookies()).delete('ACCESS_TOKEN');
}
async function setRefreshToken(token: string) {
  (await cookies()).set('REFRESH_TOKEN', token, {
    expires: Date.now() + refreshTokenExpiresAt,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

async function getRefreshToken() {
  return (await cookies()).get('REFRESH_TOKEN')?.value;
}

async function removeRefreshToken() {
  (await cookies()).delete('REFRESH_TOKEN');
}

export {
  getAccessToken,
  getHeaderAuth,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
};
