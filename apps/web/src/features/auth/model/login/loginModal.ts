import { atom } from 'jotai';

export type LoginModalMessage = {
  title: string;
  description: string;
};

export const loginModalMessageAtom = atom<LoginModalMessage | null>(null);
