import { Metadata } from 'next';
import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';

import { METADATA_SERVICE_URL } from '@/shared/config/env';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import { NAV_TYPE } from '@/shared/ui/layout/BottomNav';

import { CommunityHotDeals } from '@/features/community';

import CommunityPageClient from './CommunityPageClient';

const communityTitle = '커뮤니티 | 지름알림';
const communityDescription =
  '핫딜 정보와 쇼핑 꿀팁을 나누는 지름알림 커뮤니티. 다른 사람들이 발견한 특가 소식을 함께 확인하세요.';
const communityUrl = `${METADATA_SERVICE_URL}/community`;
const communityOgImage = `${METADATA_SERVICE_URL}/opengraph-image.webp`;

export const metadata: Metadata = {
  title: communityTitle,
  description: communityDescription,
  openGraph: {
    title: communityTitle,
    description: communityDescription,
    url: communityUrl,
    siteName: '지름알림',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: communityOgImage, width: 1200, height: 630, alt: communityTitle }],
  },
  twitter: {
    card: 'summary_large_image',
    title: communityTitle,
    description: communityDescription,
    images: communityOgImage,
  },
  alternates: {
    canonical: communityUrl,
  },
};

export default async function CommunityPage() {
  const { isMobile } = await checkDevice();
  const token = await getAccessToken();
  const isUserLogin = !!token;

  if (isMobile) {
    return (
      <BasicLayout
        hasBottomNav
        navType={NAV_TYPE.COMMUNITY}
        header={
          <header className="max-w-mobile-max border-border-subtle bg-surface-default fixed top-0 z-50 flex h-14 w-full items-center gap-x-2 border-b px-5">
            <h1 className="typography-title-18b text-fg-primary">커뮤니티</h1>
          </header>
        }
      >
        <CommunityPageClient isUserLogin={isUserLogin} />
        <CommunityHotDeals />
      </BasicLayout>
    );
  }

  const hotDeals = (
    <Suspense fallback={null}>
      <CommunityHotDeals />
    </Suspense>
  );

  return (
    <div className="py-8">
      <h1 className="text-fg-primary px-5 pb-2 text-xl font-bold">커뮤니티</h1>
      <CommunityPageClient
        isUserLogin={isUserLogin}
        insertAfterIndex={5}
        insertContent={hotDeals}
      />
    </div>
  );
}
