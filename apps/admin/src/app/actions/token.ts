'use server';

import { cookies } from 'next/headers';

async function setAccessToken(token: string) {
  const oneHour = 1 * 60 * 60 * 1000;
  cookies().set('accessToken', token, { expires: Date.now() + oneHour, httpOnly: true });
}

async function getAccessToken() {
  return cookies().get('accessToken')?.value;
}

async function deleteAccessToken() {
  cookies().delete('accessToken');
}

export { setAccessToken, getAccessToken, deleteAccessToken };
