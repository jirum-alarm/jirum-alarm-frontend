'use server';

import { cookies } from 'next/headers';

async function setAccessToken(token: string) {
  const oneHour = 1 * 60 * 60 * 1000;
  (await cookies()).set('accessToken', token, { expires: Date.now() + oneHour, httpOnly: true });
}

async function getAccessToken() {
  return (await cookies()).get('accessToken')?.value;
}

async function deleteAccessToken() {
  (await cookies()).delete('accessToken');
}

export { deleteAccessToken, getAccessToken, setAccessToken };
