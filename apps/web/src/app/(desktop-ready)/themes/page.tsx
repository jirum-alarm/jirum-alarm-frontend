import { text } from '@jirum/design-system/recipes';
import { THEME_COPY } from '@jirum/domain/mypage';
import { Metadata } from 'next';
import { Suspense } from 'react';

import { checkDevice } from '@/shared/actions/agent';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { cn } from '@/shared/lib/cn';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import SectionHeader from '@/shared/ui/SectionHeader';

import ThemeList from '@/features/mypage/ui/theme/ThemeList';

const themesTitle = '관심사별 핫딜 알림 | 지름알림';
const themesUrl = `${METADATA_SERVICE_URL}/themes`;
const themesOgImage = `${METADATA_SERVICE_URL}/opengraph-image.webp`;

// openGraph·twitter 를 안 주면 루트(홈)의 제목·설명·주소가 그대로 나간다(얕은 병합) — 공유 카드가 홈으로 보였다(2026-10-22).
export const metadata: Metadata = {
  title: themesTitle,
  description: THEME_COPY.intro,
  alternates: { canonical: '/themes' },
  openGraph: {
    title: themesTitle,
    description: THEME_COPY.intro,
    url: themesUrl,
    images: [{ url: themesOgImage, width: 1200, height: 630, alt: themesTitle }],
    type: 'website',
    siteName: '지름알림',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: themesTitle,
    description: THEME_COPY.intro,
    images: themesOgImage,
  },
};

const ThemesPage = async () => {
  const { isMobile } = await checkDevice();

  // PC 는 큐레이션(curation/[id])과 같은 틀: SectionHeader 중앙 타이틀 + max-w-layout-max.
  if (!isMobile) {
    return (
      <div className="mt-14 pt-8">
        <h1 className="sr-only">관심사별 핫딜 알림</h1>
        <SectionHeader title="관심사별 핫딜 알림" />
        <p className={cn(text.muted, 'mb-8 text-center')}>{THEME_COPY.intro}</p>
        <div className="max-w-layout-max mx-auto px-5 pb-16">
          <Suspense>
            <ThemeList isMobile={false} />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <BasicLayout hasBackButton title="관심사별 핫딜 알림">
      <div className="relative h-full px-5 py-6">
        <h1 className="sr-only">관심사별 핫딜 알림</h1>
        <p className={cn(text.muted, 'mb-5')}>{THEME_COPY.intro}</p>
        <Suspense>
          <ThemeList isMobile />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default ThemesPage;
