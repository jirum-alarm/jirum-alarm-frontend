'use client';

import { atom } from 'recoil';

export const fcmTokenAtom = atom<string | null>({
  key: '#fcmTokenAtom',
  default: null,
});
