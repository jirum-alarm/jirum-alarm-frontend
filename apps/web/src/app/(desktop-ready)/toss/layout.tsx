import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';

import { PAGE } from '@/shared/config/page';
import { Search } from '@/shared/ui/common/icons';
import BackButton from '@/shared/ui/layout/BackButton';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import Link from '@/shared/ui/Link';
import SectionHeader from '@/shared/ui/SectionHeader';
import ShareButton from '@/shared/ui/ShareButton';

import Footer from '@/widgets/layout/ui/desktop/Footer';

const TITLE = '토스 특가';

export default async function Layout({ children }: { children: ReactNode }) {
  const { isMobile } = await checkDevice();

  if (isMobile) {
    return (
      <BasicLayout
        header={
          <header className="max-w-mobile-max fixed top-0 z-40 flex h-14 w-full items-center justify-between bg-white px-5">
            <div className="flex grow items-center gap-x-1">
              <BackButton backTo={PAGE.HOME} />
              <h2 className="line-clamp-1 text-lg font-semibold text-black">{TITLE}</h2>
            </div>
            <div className="flex items-center gap-x-4">
              <Link href={PAGE.SEARCH} aria-label="검색" title="검색" className="py-2">
                <Search />
              </Link>
              <ShareButton title={`${TITLE} | 지름알림`} />
            </div>
          </header>
        }
      >
        {children}
        <Footer />
      </BasicLayout>
    );
  }

  return (
    <div className="mt-14 pt-8">
      <SectionHeader title={TITLE} />
      <div className="max-w-layout-max mx-auto">{children}</div>
    </div>
  );
}
