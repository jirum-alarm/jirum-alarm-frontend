'use client';

import { useQuery, useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { type ReactNode, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { HotDealType } from '@/shared/api/gql/graphql';
import type { ThemeLiveDeal, ThemeWithKeywords } from '@/shared/api/notification/theme.service';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';
import { cn } from '@/shared/lib/cn';
import Button from '@/shared/ui/common/Button';
import { LoadingSpinner } from '@/shared/ui/common/icons';
import DetailSectionHeader from '@/shared/ui/DetailSectionHeader';
import SectionHeader from '@/shared/ui/SectionHeader';

import { ThemeQueries } from '@/entities/notification';
import { type ProductCardType } from '@/entities/product-list/model/types';
import ProductGridList from '@/entities/product-list/ui/grid/ProductGridList';

import { useThemeSubscription } from '../../model/useThemeSubscription';

// 구독자 수는 이 이상일 때만 보인다 — "0명 구독 중"은 구독을 말리는 신호라서.
const SUBSCRIBER_COUNT_MIN_VISIBLE = 10;

// 미리보기 딜(ThemeLiveDeal) → 기존 상품 카드 타입(ProductCardType) 매핑.
const toCard = (d: ThemeLiveDeal): ProductCardType => ({
  id: d.id,
  title: d.title,
  thumbnail: d.thumbnail,
  price: d.price,
  postedAt: new Date(d.postedAt),
  categoryId: d.categoryId,
  isEnd: d.isEnd,
  isHot: d.isHot,
  hotDealType: (d.hotDealType as HotDealType) ?? null,
  mallName: d.mallName,
  provider: d.provider,
});

// 발송 배치와 같은 기준으로 고른 "알림을 켰다면 받았을" 딜. 기간 제한 없이 무한 스크롤(큐레이션과 같은 방식).
const ThemeDealList = ({ themeId }: { themeId: number }) => {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    ThemeQueries.deals(themeId),
  );
  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
  });
  const deals = useMemo(() => data.pages.flat().map(toCard), [data.pages]);

  if (deals.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gray-500">
        아직 이 관심사에 맞는 딜이 없었어요.
      </p>
    );
  }

  return (
    <>
      <ProductGridList products={deals} source="notification_theme" />
      <div className="flex w-full items-center justify-center py-6" ref={ref}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </>
  );
};

// 처음엔 이만큼만 칩으로 보여주고 나머지는 "더 보기".
const KEYWORD_PREVIEW_COUNT = 12;

/**
 * 관심사 알림이 딜을 고르는 조건. 숫자는 crawling-server 발송 배치와 같아야 한다 —
 * THEME_MIN_SCORE(상위 ~7%)·THEME_SLOTS_PER_DAY(3)·크론 KST 10·14·20시(util/pick-theme-deals.ts).
 * 앱 ThemeDetailScreen 에 같은 문구가 있다.
 */
const ThemeConditions = ({ theme }: { theme: ThemeWithKeywords }) => {
  const [showAll, setShowAll] = useState(false);
  const keywords = theme.keywords.length ? theme.keywords : theme.representativeKeywords;
  const visible = showAll ? keywords : keywords.slice(0, KEYWORD_PREVIEW_COUNT);
  const hidden = keywords.length - visible.length;

  return (
    <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-100">
      <ConditionRow icon="🔎" title={`키워드 ${keywords.length}개 중 하나라도 제목에 있으면`}>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {visible.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
            >
              {keyword}
            </span>
          ))}
          {hidden > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              +{hidden}개 더 보기
            </button>
          )}
        </div>
      </ConditionRow>
      <ConditionRow icon="🔥" title="반응 좋은 딜만">
        조회·추천·댓글이 몰린 커뮤니티 상위 약 7% 딜만 골라요.
      </ConditionRow>
      <ConditionRow icon="⏰" title="하루 최대 3건">
        오전 10시 · 오후 2시 · 오후 8시에 그때 가장 좋은 딜 1건씩.
      </ConditionRow>
      <ConditionRow icon="🔁" title="받은 딜은 다시 안 보내요">
        키워드 알림이나 앞선 시간에 이미 받은 딜은 건너뛰고 다음 딜로.
      </ConditionRow>
      <ConditionRow icon="🧹" title="엉뚱한 딜은 걸러요">
        여러 상품을 늘어놓은 모음 글, 사은품 문구에만 키워드가 걸린 딜은 빼요.
      </ConditionRow>
      {theme.weeklyAlertCount > 0 && (
        <ConditionRow icon="📬" title={`지난 7일이었다면 ${theme.weeklyAlertCount}건`}>
          이 조건으로 지난 일주일 동안 받았을 알림 수예요.
        </ConditionRow>
      )}
    </ul>
  );
};

const ConditionRow = ({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) => (
  <li className="flex gap-3 px-4 py-3.5">
    <span className="text-lg leading-6" aria-hidden>
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <div className="mt-0.5 text-sm text-gray-500">{children}</div>
    </div>
  </li>
);

// 레이아웃은 큐레이션 상세(curation/[id])와 같은 틀: PC 는 SectionHeader 중앙 타이틀 + 5열 그리드.
const ThemeDetail = ({ themeId, isMobile = true }: { themeId: number; isMobile?: boolean }) => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());
  const { data: subscribedIds = [] } = useQuery(ThemeQueries.mySubscribedIds());
  const { subscribe, unsubscribe, isPending } = useThemeSubscription();
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();

  const theme = themes.find((t) => Number(t.id) === themeId);
  if (!theme) return null;

  const isSubscribed = new Set(subscribedIds).has(themeId);
  const title = `${theme.emoji ?? ''} ${theme.name}`.trim();

  return (
    <div className={isMobile ? 'pb-10' : 'pb-16'}>
      {isMobile ? (
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      ) : (
        <SectionHeader title={title} />
      )}

      <div className={cn('mt-1', !isMobile && 'mx-auto max-w-xl text-center')}>
        <p className="text-sm text-gray-500">{theme.description}</p>
        {theme.subscriberCount >= SUBSCRIBER_COUNT_MIN_VISIBLE && (
          <p className="mt-1 text-xs text-gray-400">
            {theme.subscriberCount.toLocaleString()}명이 알림 받는 중
          </p>
        )}
        <Button
          color={isSubscribed ? 'secondary' : 'primary'}
          disabled={isPending}
          className={cn('mt-4', !isMobile && 'w-60')}
          onClick={() => {
            // 비로그인은 알림을 켤 수 없다(서버 403) → 로그인으로 유도.
            if (checkAndRedirect()) return;
            if (isSubscribed) unsubscribe(themeId);
            else subscribe(themeId);
          }}
        >
          {isSubscribed ? '알림 받는 중 · 끄기' : '알림 받기'}
        </Button>
        <p className="mt-2 text-xs text-gray-400">
          키워드를 하나하나 등록하지 않아도, 반응 좋은 딜만 하루 최대 3건 보내드려요.
        </p>
      </div>

      <section className="mt-8">
        <DetailSectionHeader
          as="h3"
          title="이렇게 골라서 보내드려요"
          subtitle="딜이 뜰 때마다 울리는 게 아니라, 아래 조건을 다 통과한 딜만 와요."
        />
        <ThemeConditions theme={theme} />
      </section>

      <section className="mt-10">
        <DetailSectionHeader
          as="h3"
          title="알림을 켰다면 이런 딜을 받았어요"
          subtitle="반응 좋은 딜만 하루 최대 3건 · 최신순"
        />
        <div className="mt-4">
          <ThemeDealList themeId={themeId} />
        </div>
      </section>
    </div>
  );
};

export default ThemeDetail;
