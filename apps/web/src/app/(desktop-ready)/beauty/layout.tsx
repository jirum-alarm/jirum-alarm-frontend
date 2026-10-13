import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';

import { PAGE } from '@/shared/config/page';
import { Search } from '@/shared/ui/common/icons';
import BackButton from '@/shared/ui/layout/BackButton';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import PageHeader from '@/shared/ui/layout/PageHeader';
import Link from '@/shared/ui/Link';
import SectionHeader from '@/shared/ui/SectionHeader';
import ShareButton from '@/shared/ui/ShareButton';

import Footer from '@/widgets/layout/ui/desktop/Footer';

const TITLE = '뷰티 핫딜';

export default async function Layout({ children }: { children: ReactNode }) {
  const { isMobile } = await checkDevice();

  if (isMobile) {
    return (
      <BasicLayout
        header={
          <PageHeader
            leading={<BackButton backTo={PAGE.HOME} />}
            title={TITLE}
            actions={
              <>
                <Link href={PAGE.SEARCH} aria-label="검색" title="검색" className="-m-2 p-2">
                  <Search />
                </Link>
                <ShareButton title={`${TITLE} | 지름알림`} />
              </>
            }
          />
        }
      >
        {children}
        <Footer />
      </BasicLayout>
    );
  }

  return (
    <div className="mt-14 pt-8">
      {/* h1 은 모바일은 PageHeader 가 그리고, 데스크톱은 SectionHeader(h2)뿐이라 여기서 하나 둔다
          (trending/layout.tsx 와 같은 방식 — 크롤러는 대부분 데스크톱 UA). */}
      <h1 className="sr-only">{TITLE}</h1>
      <SectionHeader title={TITLE} />
      <div className="max-w-layout-max mx-auto">{children}</div>
    </div>
  );
}
