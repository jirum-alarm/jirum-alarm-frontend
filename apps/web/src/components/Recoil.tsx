'use client';

import { RecoilRoot } from 'recoil';

type Props = {
  children: React.ReactNode;
};
/**
 * @deprecated
 */
export default function Recoil({ children }: Props) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
