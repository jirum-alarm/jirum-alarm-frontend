import { Suspense } from 'react';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
