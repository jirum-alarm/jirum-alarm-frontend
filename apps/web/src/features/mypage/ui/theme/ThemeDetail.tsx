'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { HotDealType } from '@/shared/api/gql/graphql';
import type { ThemeLiveDeal } from '@/shared/api/notification/theme.service';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';

import { ThemeQueries } from '@/entities/notification';
import { type ProductCardType } from '@/entities/product-list/model/types';
import ListProductCard from '@/entities/product-list/ui/list/ListProductCard';

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
});

const ThemeDetail = ({ themeId, isMobile = true }: { themeId: number; isMobile?: boolean }) => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());
  const { data: subscribedIds = [] } = useQuery(ThemeQueries.mySubscribedIds());
  const { data: deals } = useSuspenseQuery(ThemeQueries.liveDeals(themeId));
  const { subscribe, unsubscribe, isPending } = useThemeSubscription();
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();

  const theme = themes.find((t) => Number(t.id) === themeId);
  if (!theme) return null;

  const isSubscribed = new Set(subscribedIds).has(themeId);

  // 구독↔해제 한 버튼 토글
  const SubscribeButton = ({ className = '' }: { className?: string }) => (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        // 비로그인은 구독 불가(서버 403) → 로그인으로 유도. 실패 토스트 대신 로그인 플로우.
        if (checkAndRedirect()) return;
        if (isSubscribed) unsubscribe(themeId);
        else subscribe(themeId);
      }}
      className={`rounded-xl text-base font-semibold disabled:opacity-50 ${
        isSubscribed ? 'bg-gray-100 text-gray-500' : 'bg-primary-500 text-white'
      } ${className}`}
    >
      {isSubscribed ? '구독 중 (해제)' : '이 묶음 구독'}
    </button>
  );

  return (
    <div className={isMobile ? 'pb-10' : 'mx-auto max-w-3xl'}>
      {/* 헤더: 이모지 + 이름 + 설명 / 구독 버튼 상단 우측 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          {theme.emoji && <span className="text-2xl">{theme.emoji}</span>}
          <div>
            <h2 className="text-lg font-bold text-gray-900">{theme.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{theme.description}</p>
            {theme.subscriberCount >= SUBSCRIBER_COUNT_MIN_VISIBLE && (
              <p className="mt-1 text-xs text-gray-400">
                {theme.subscriberCount.toLocaleString()}명이 구독 중
              </p>
            )}
          </div>
        </div>
        {/* PC: 헤더 옆 인라인 / 모바일: 헤더 아래 전체폭은 키워드 아래로 */}
        {!isMobile && <SubscribeButton className="shrink-0 px-8 py-3" />}
      </div>

      {/* 모바일: 구독 버튼을 헤더 바로 아래 전체폭(상단) */}
      {isMobile && <SubscribeButton className="mt-4 w-full py-3.5" />}

      {/* 포함 키워드 */}
      <div className="mt-6">
        <h3 className="mb-2 text-sm font-medium text-gray-900">포함 키워드</h3>
        <div className="flex flex-wrap gap-1.5">
          {theme.representativeKeywords.map((keyword) => (
            <span key={keyword} className="rounded-md bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* 미리보기 — 서버 발송 배치와 같은 기준으로 고른 "구독했다면 받았을" 딜 */}
      <div className="mt-7">
        <h3 className="text-sm font-medium text-gray-900">
          📬 구독했다면 최근 7일 받았을 알림{' '}
          <span className="text-primary-500">{deals.length}건</span>
        </h3>
        <p className="mt-1 mb-3 text-xs text-gray-400">
          반응 좋은 딜만 골라 하루 최대 3건 보내드려요.
        </p>
        {deals.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            최근 7일엔 이 묶음에 맞는 딜이 없었어요.
          </p>
        ) : (
          <div className={isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-2 gap-x-8 gap-y-4'}>
            {deals.map((deal) => (
              <ListProductCard key={deal.id} product={toCard(deal)} source="notification_theme" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeDetail;
