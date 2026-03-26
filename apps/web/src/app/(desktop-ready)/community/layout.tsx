import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';

import Footer from '@/widgets/layout/ui/desktop/Footer';

export default async function CommunityLayout({ children }: { children: ReactNode }) {
  const { isMobile } = await checkDevice();

  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="pt-14">
      <div className="max-w-layout-max mx-auto px-5">{children}</div>
      <Footer />
    </div>
  );
}
