'use client';
import { atom } from 'recoil';

import { User } from '../types/user';

export const userState = atom<User | null>({
  key: 'userState',
  default: undefined,
});
