'use server';

import { accessTokenExpiresAt, refreshTokenExpiresAt } from '@/constants/token';
import { cookies } from 'next/headers';

async function setAccessToken(token: string) {
  cookies().set('ACCESS_TOKEN', token, {
    expires: Date.now() + accessTokenExpiresAt,
    httpOnly: false,
  });
}

async function getAccessToken() {
  return cookies().get('ACCESS_TOKEN')?.value;
}

async function removeAccessToken() {
  cookies().delete('ACCESS_TOKEN');
}
async function setRefreshToken(token: string) {
  cookies().set('REFRESH_TOKEN', token, {
    expires: Date.now() + refreshTokenExpiresAt,
    httpOnly: true,
  });
}

async function getRefreshToken() {
  return cookies().get('REFRESH_TOKEN')?.value;
}

async function removeRefreshToken() {
  cookies().delete('REFRESH_TOKEN');
}

export {
  setAccessToken,
  getAccessToken,
  removeAccessToken,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,
};
