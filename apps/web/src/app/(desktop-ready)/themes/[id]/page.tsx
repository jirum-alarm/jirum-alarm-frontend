import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';

import { themePath, ThemeService } from '@/shared/api/notification/theme.service';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import BackButton from '@/shared/ui/layout/BackButton';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import PageHeader from '@/shared/ui/layout/PageHeader';
import ShareButton from '@/shared/ui/ShareButton';

import ThemeDetail from '@/features/mypage/ui/theme/ThemeDetail';

type Params = Promise<{ id: string }>;

// 세그먼트는 slug(`/themes/snacks-ice-cream`)가 정식이고, 옛 숫자 id 링크(`/themes/72`)도 받는다.
const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s; // 깨진 %시퀀스 → 그대로 비교해 404 로 떨어진다(500 대신)
  }
};

async function findTheme(param: string) {
  const key = safeDecode(param);
  const themes = await ThemeService.getThemesPublic();
  return themes.find((t) => t.slug === key) ?? themes.find((t) => String(t.id) === key);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const theme = await findTheme((await params).id);
  if (!theme) return { title: '관심사별 핫딜 알림 | 지름알림' };

  // 검색 의도("과자 핫딜")에 맞춰 이름 + 핫딜을 앞에, 대표 키워드로 무엇이 걸리는지 설명에 담는다.
  const title = `${theme.name} 핫딜 모음 · 알림 | 지름알림`;
  const description = `${theme.description}. ${theme.representativeKeywords.slice(0, 6).join(', ')} 핫딜을 반응 좋은 것만 하루 최대 3건 알려드려요.`;
  const url = `${METADATA_SERVICE_URL}${themePath(theme)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
  };
}

const ThemeDetailPage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  const theme = await findTheme(id);
  if (!theme) notFound();
  // 옛 id URL → slug 로 영구 이동(색인·공유 링크를 한 주소로 모은다).
  if (theme.slug && safeDecode(id) !== theme.slug) permanentRedirect(themePath(theme));

  const themeId = Number(theme.id);
  const { isMobile } = await checkDevice();

  // 큐레이션(curation/[id])과 같은 틀. PC: 넓은 컨테이너(타이틀은 ThemeDetail 의 SectionHeader).
  // 모바일: 뒤로가기 + 공유 헤더 — 공유 링크로 들어온 사람도 원탭 구독하게 하는 게 이 화면의 목적.
  if (!isMobile) {
    return (
      <div className="mt-14 pt-8">
        <h1 className="sr-only">{theme.name} 핫딜 알림</h1>
        <div className="max-w-layout-max mx-auto px-5 pb-16">
          <Suspense>
            <ThemeDetail themeId={themeId} isMobile={false} />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <BasicLayout
      header={
        <PageHeader
          leading={<BackButton backTo="/themes" />}
          title="관심사별 핫딜 알림"
          actions={<ShareButton title={`${theme.name} 핫딜 알림 | 지름알림`} />}
        />
      }
    >
      <div className="relative h-full px-5 py-6">
        <Suspense>
          <ThemeDetail themeId={themeId} isMobile />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default ThemeDetailPage;
