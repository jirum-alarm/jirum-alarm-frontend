import { ReactNode } from 'react';

import { checkDevice } from '@/shared/actions/agent';
import { PAGE } from '@/shared/config/page';
import { Search } from '@/shared/ui/common/icons';
import BackButton from '@/shared/ui/layout/BackButton';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import PageHeader from '@/shared/ui/layout/PageHeader';
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
          <PageHeader
            leading={<BackButton backTo={PAGE.HOME} />}
            // 문자열을 넘기면 PageHeader 가 h1 을 만든다 — page.tsx 의 「토스 하루특가」 h1 과 겹쳐 모바일만 h1 이 둘이었다.
            title={<span className="truncate text-lg font-semibold text-gray-900">{TITLE}</span>}
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
      <SectionHeader title={TITLE} />
      <div className="max-w-layout-max mx-auto">{children}</div>
    </div>
  );
}
