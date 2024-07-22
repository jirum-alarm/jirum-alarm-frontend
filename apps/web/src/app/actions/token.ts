'use server';

import { cookies } from 'next/headers';

async function setAccessToken(token: string) {
  const oneHour = 1 * 60 * 60 * 1000; // 1hour
  cookies().set('ACCESS_TOKEN', token, { expires: Date.now() + oneHour, httpOnly: true });
}

async function getAccessToken() {
  return cookies().get('ACCESS_TOKEN')?.value;
}

async function removeAccessToken() {
  cookies().delete('ACCESS_TOKEN');
}
async function setRefreshToken(token: string) {
  const sevendDays = 7 * 24 * 60 * 60 * 1000; // 7day
  cookies().set('REFRESH_TOKEN', token, { expires: Date.now() + sevendDays, httpOnly: true });
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
