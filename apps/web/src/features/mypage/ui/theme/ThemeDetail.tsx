'use client';

import { sectionTitle, text, wordTag } from '@jirum/design-system/recipes';
import { THEME_COPY } from '@jirum/domain/mypage';
import { useQuery, useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { type ReactNode, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { HotDealType } from '@/shared/api/gql/graphql';
import type { ThemeLiveDeal, ThemeWithKeywords } from '@/shared/api/notification/theme.service';
import useAlertSession from '@/shared/hooks/useAlertSession';
import { cn } from '@/shared/lib/cn';
import Button from '@/shared/ui/common/Button';
import { LoadingSpinner } from '@/shared/ui/common/icons';
import DetailSectionHeader from '@/shared/ui/DetailSectionHeader';
import SectionHeader from '@/shared/ui/SectionHeader';

import { findKeywordHubForQuery, keywordHubPath } from '@/entities/keyword-hub/lib/keyword-hub';
import { useKeywordHubs } from '@/entities/keyword-hub/model/useKeywordHubs';
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
      <p className={cn(text.muted, 'py-10 text-center')}>아직 이 관심사에 맞는 딜이 없었어요.</p>
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
  // 허브 페이지가 있는 키워드는 그 허브로 잇는다(테마 → 키워드 → 딜 한 층씩 내려가기). 목록이 없으면 글자만.
  const { data: hubs } = useKeywordHubs();

  return (
    <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-100">
      <ConditionRow icon="🔎" title={THEME_COPY.criteriaKeywords(keywords.length)}>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {visible.map((keyword) => {
            const hub = hubs ? findKeywordHubForQuery(keyword, hubs) : undefined;
            const className = cn(
              wordTag.box,
              wordTag.text,
              wordTag.tone.fill.box,
              wordTag.tone.fill.text,
            );
            return hub ? (
              <Link
                key={keyword}
                href={keywordHubPath(hub)}
                data-track="keyword-hub-link"
                data-source="notification_theme"
                className={cn(className, 'hover:bg-gray-200')}
              >
                {keyword} ›
              </Link>
            ) : (
              <span key={keyword} className={className}>
                {keyword}
              </span>
            );
          })}
          {hidden > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className={cn(
                'hover:bg-gray-50',
                wordTag.box,
                wordTag.text,
                wordTag.tone.more.box,
                wordTag.tone.more.text,
              )}
            >
              +{hidden}개 더 보기
            </button>
          )}
        </div>
      </ConditionRow>
      <ConditionRow icon="🔥" title="반응 좋은 딜만">
        {THEME_COPY.criteriaQuality}
      </ConditionRow>
      <ConditionRow icon="⏰" title="하루 최대 3건">
        {THEME_COPY.criteriaSchedule}
      </ConditionRow>
      <ConditionRow icon="🔁" title="받은 딜은 다시 안 보내요">
        {THEME_COPY.criteriaSkip}
      </ConditionRow>
      <ConditionRow icon="🧹" title="엉뚱한 딜은 걸러요">
        {THEME_COPY.criteriaExcludeRoundups}
        {theme.excludeKeywords.length > 0 && (
          <>
            <p className="mt-2">{THEME_COPY.criteriaExcludeWords}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {theme.excludeKeywords.map((word) => (
                <span
                  key={word}
                  className={cn(
                    wordTag.box,
                    wordTag.text,
                    wordTag.tone.struck.box,
                    wordTag.tone.struck.text,
                  )}
                >
                  {word}
                </span>
              ))}
            </div>
          </>
        )}
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
      <p className={text.label}>{title}</p>
      <div className={cn(text.muted, 'mt-0.5')}>{children}</div>
    </div>
  </li>
);

// 레이아웃은 큐레이션 상세(curation/[id])와 같은 틀: PC 는 SectionHeader 중앙 타이틀 + 5열 그리드.
const ThemeDetail = ({ themeId, isMobile = true }: { themeId: number; isMobile?: boolean }) => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());
  const { data: subscribedIds = [] } = useQuery(ThemeQueries.mySubscribedIds());
  const { subscribe, unsubscribe, isPending } = useThemeSubscription();
  const { ensureAlertSession } = useAlertSession();

  const theme = themes.find((t) => Number(t.id) === themeId);
  if (!theme) return null;

  const isSubscribed = new Set(subscribedIds).has(themeId);
  const title = `${theme.emoji ?? ''} ${theme.name}`.trim();

  return (
    <div className={isMobile ? 'pb-10' : 'pb-16'}>
      {isMobile ? <h2 className={sectionTitle.page}>{title}</h2> : <SectionHeader title={title} />}

      <div className={cn('mt-1', !isMobile && 'mx-auto max-w-xl text-center')}>
        <p className={text.muted}>{theme.description}</p>
        {theme.subscriberCount >= SUBSCRIBER_COUNT_MIN_VISIBLE && (
          <p className={cn(text.caption, 'mt-1')}>
            {theme.subscriberCount.toLocaleString()}명이 알림 받는 중
          </p>
        )}
        <Button
          color={isSubscribed ? 'secondary' : 'primary'}
          disabled={isPending}
          className={cn('mt-4', !isMobile && 'w-60')}
          onClick={async () => {
            // 비로그인은 게스트 계정으로 바로 구독한다(앱 웹뷰는 로그인으로).
            if (!(await ensureAlertSession())) return;
            if (isSubscribed) unsubscribe(themeId);
            else subscribe(themeId);
          }}
        >
          {isSubscribed ? THEME_COPY.subscribedToggle : '알림 받기'}
        </Button>
        <p className={cn(text.caption, 'mt-2')}>
          키워드를 하나하나 등록하지 않아도, 반응 좋은 딜만 하루 최대 3건 보내드려요.
        </p>
      </div>

      <section className="mt-8">
        <DetailSectionHeader
          as="h3"
          title={THEME_COPY.criteriaTitle}
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
