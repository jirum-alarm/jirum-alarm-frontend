'use server';

import { cookies } from 'next/headers';

import { accessTokenExpiresAt, refreshTokenExpiresAt } from '@/constants/token';

async function setAccessToken(token: string) {
  (await cookies()).set('ACCESS_TOKEN', token, {
    expires: Date.now() + accessTokenExpiresAt,
    httpOnly: false,
  });
}

async function getAccessToken() {
  return (await cookies()).get('ACCESS_TOKEN')?.value;
}

async function removeAccessToken() {
  (await cookies()).delete('ACCESS_TOKEN');
}
async function setRefreshToken(token: string) {
  (await cookies()).set('REFRESH_TOKEN', token, {
    expires: Date.now() + refreshTokenExpiresAt,
    httpOnly: true,
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
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
};
