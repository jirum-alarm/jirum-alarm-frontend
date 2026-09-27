'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { HotDealType } from '@/shared/api/gql/graphql';
import type { ThemeLiveDeal } from '@/shared/api/notification/theme.service';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';
import { cn } from '@/shared/lib/cn';
import Button from '@/shared/ui/common/Button';
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

// 레이아웃은 큐레이션 상세(curation/[id])와 같은 틀: PC 는 SectionHeader 중앙 타이틀 + 5열 그리드.
const ThemeDetail = ({ themeId, isMobile = true }: { themeId: number; isMobile?: boolean }) => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());
  const { data: subscribedIds = [] } = useQuery(ThemeQueries.mySubscribedIds());
  const { data: deals } = useSuspenseQuery(ThemeQueries.liveDeals(themeId));
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
            {theme.subscriberCount.toLocaleString()}명이 구독 중
          </p>
        )}
        <Button
          color={isSubscribed ? 'secondary' : 'primary'}
          disabled={isPending}
          className={cn('mt-4', !isMobile && 'w-60')}
          onClick={() => {
            // 비로그인은 구독 불가(서버 403) → 로그인으로 유도. 실패 토스트 대신 로그인 플로우.
            if (checkAndRedirect()) return;
            if (isSubscribed) unsubscribe(themeId);
            else subscribe(themeId);
          }}
        >
          {isSubscribed ? '구독 중 · 해제하기' : '이 묶음 구독하기'}
        </Button>
      </div>

      <section className="mt-8">
        <DetailSectionHeader as="h3" title="포함 키워드" />
        <div className="mt-3 flex flex-wrap gap-2">
          {theme.representativeKeywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
            >
              {keyword}
            </span>
          ))}
        </div>
      </section>

      {/* 미리보기 — 서버 발송 배치와 같은 기준으로 고른 "구독했다면 받았을" 딜 */}
      <section className="mt-10">
        <DetailSectionHeader
          as="h3"
          title={`구독했다면 최근 7일 받았을 알림 ${deals.length}건`}
          subtitle="반응 좋은 딜만 골라 하루 최대 3건 보내드려요."
        />
        <div className="mt-4">
          {deals.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              최근 7일엔 이 묶음에 맞는 딜이 없었어요.
            </p>
          ) : (
            <ProductGridList products={deals.map(toCard)} source="notification_theme" />
          )}
        </div>
      </section>
    </div>
  );
};

export default ThemeDetail;
