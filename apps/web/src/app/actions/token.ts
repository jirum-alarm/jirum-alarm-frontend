'use server';

import { cookies, headers } from 'next/headers';

import { accessTokenExpiresAt, refreshTokenExpiresAt } from '@/shared/config/token';

async function setAccessToken(token: string) {
  (await cookies()).set('ACCESS_TOKEN', token, {
    expires: Date.now() + accessTokenExpiresAt,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

async function setRefreshToken(token: string) {
  (await cookies()).set('REFRESH_TOKEN', token, {
    expires: Date.now() + refreshTokenExpiresAt,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

async function setDistinctId(id: string | null) {
  (await cookies()).set('DISTINCT_ID', id ?? '', {
    expires: Date.now() + refreshTokenExpiresAt,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
async function setFcmToken(token?: string) {
  (await cookies()).set('FCM_TOKEN', token ?? '', {
    expires: Date.now() + refreshTokenExpiresAt,
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

async function getDistinctId() {
  return (await cookies()).get('DISTINCT_ID')?.value ?? null;
}

async function getFcmToken() {
  return (await cookies()).get('FCM_TOKEN')?.value ?? null;
}

async function removeAccessToken() {
  (await cookies()).delete('ACCESS_TOKEN');
}

async function getRefreshToken() {
  return (await cookies()).get('REFRESH_TOKEN')?.value;
}

async function removeRefreshToken() {
  (await cookies()).delete('REFRESH_TOKEN');
}

export {
  getAccessToken,
  getDistinctId,
  getFcmToken,
  getHeaderAuth,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setDistinctId,
  setFcmToken,
  setRefreshToken,
};
