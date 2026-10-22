'use client';

import { emptyText, text, wordTag } from '@jirum/design-system/recipes';
import { buildDealStatusSummary, splitReactionKeywords } from '@jirum/domain/deal-status-reaction';
import { useSuspenseQuery } from '@tanstack/react-query';
import * as m from 'motion/react-m';
import { Suspense } from 'react';

import { cn } from '@/shared/lib/cn';
import { getFromNow } from '@/shared/lib/utils/date';
import { ArrowRight, Info, Thumbsdown, Thumbsup } from '@/shared/ui/common/icons';
import Tooltip from '@/shared/ui/common/Tooltip';
import DetailSectionHeader from '@/shared/ui/DetailSectionHeader';

import { ProductQueries } from '@/entities/product';

import ProductReport from '@/features/product-actions/ui/ProductReport';
import { useRegisterSection } from '@/features/product-detail/hooks/useSectionPresence';
import { Reactions } from '@/features/product-reaction/ui/Reactions';

type ReactionItem = {
  name: string;
  tag: string;
  count: number;
  type: 'POSITIVE' | 'NEGATIVE' | 'SYNONYM' | string;
  role?: string | null;
};

const MIN_REACTIONS_FOR_PERCENT = 5;

// 토스(21)·네이버(101)·오늘의집(102)은 커뮤니티 글이 아니라 몰 상품이라 product.url 이 제휴 태그 없는
// 원본 몰 링크다. "반응 보기"로 내보내면 구매 CTA(제휴 링크)를 우회한다
// (GA4 에서 원본 링크 클릭이 적지 않게 잡혔다). 이 딜은 링크를 숨기고 CTA 로만 나가게 한다.
const MALL_SOURCED_PROVIDER_IDS = new Set(['21', '101', '102']);

function CommunityLink({ url, provider }: { url: string; provider: string }) {
  return (
    <m.a
      className="text-secondary-600 flex items-center gap-x-1 text-xs font-semibold"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <span>{provider} 반응 보기</span>
      <span className="bg-secondary-500 flex size-4 items-center justify-center rounded-full">
        <ArrowRight color="var(--color-fixed-white)" width={12} height={12} strokeWidth={1.5} />
      </span>
    </m.a>
  );
}

/**
 * 반응 키워드 한 개 — 누를 수 없는 단어(wordTag). 예전엔 흰 바탕·테두리 알약이라 버튼처럼 보여 눌러 보는
 * 사람이 많았는데(Clarity dead click, 2026-10-20) 아무 일도 없었다. 키워드가 «좋아했어요»·«가격이 싸요» 같은
 * 반응 문구라 검색어로 보낼 수도 없어(엉뚱한 결과) 모양을 «누를 수 없는 단어»로 바꿨다. 긍·부정은 숫자 색이 말한다.
 * 면은 onTint(흰 면) — 기본 회색 면은 파란 카드 위에서 탁했다(2026-10-22).
 */
function KeywordChip({ item }: { item: ReactionItem }) {
  return (
    <li className={cn('flex gap-x-1', wordTag.box, wordTag.tone.onTint.box, wordTag.text)}>
      {item.tag ? <span className="font-medium text-gray-600">{item.tag}</span> : null}
      <span className="font-medium text-gray-900">{item.name}</span>
      <span
        className={cn('font-semibold', {
          'text-secondary-700': item.type === 'POSITIVE',
          'text-error-400': item.type === 'NEGATIVE',
          'text-gray-500': item.type !== 'POSITIVE' && item.type !== 'NEGATIVE',
        })}
      >
        {item.count}
      </span>
    </li>
  );
}

/**
 * 커뮤니티 반응 — 품질 반응만 (품절·종료·가격변동 등 상태 신호 제외).
 */
export default function CommunityReaction({ productId }: { productId: number }) {
  // 가격 아래 근거 블록(커뮤니티 근거)의 「근거 보기 ›」는 이 섹션이 그려졌을 때만 뜬다.
  useRegisterSection('community-reaction', true);
  const { data: product } = useSuspenseQuery(
    ProductQueries.productAdditionalInfo({ id: productId }),
  );
  const { data: reactionKeywordsData } = useSuspenseQuery(
    ProductQueries.reactionKeywords({ id: productId }),
  );

  const { items, lastUpdatedAt: lastUpdatedAtString } =
    reactionKeywordsData.categorizedReactionKeywords;
  const lastUpdatedAt = lastUpdatedAtString ? getFromNow(lastUpdatedAtString) + ' 업데이트' : null;

  const { quality, status } = splitReactionKeywords(items);
  const positiveItems = quality.filter((item) => item.type === 'POSITIVE');
  const negativeItems = quality.filter((item) => item.type === 'NEGATIVE');
  const statusSummary = buildDealStatusSummary(status);

  // QUALITY 칩 기준 % (서버 pos/neg도 DEAL_STATUS 제외와 동일 정책)
  const positiveCount = positiveItems.reduce((sum, item) => sum + item.count, 0);
  const negativeCount = negativeItems.reduce((sum, item) => sum + item.count, 0);
  const allCount = positiveCount + negativeCount;
  const positivePercent = allCount === 0 ? 0 : Math.round((positiveCount / allCount) * 100);
  const isPositive = positivePercent >= 50;
  const dominantPercent = isPositive ? positivePercent : 100 - positivePercent;
  // 반응이 몇 개 없으면 %가 과장된다(2개로 "100%") — 그땐 개수를 보인다. 앱 CommunityReaction 과 같은 기준.
  const share = allCount < MIN_REACTIONS_FOR_PERCENT ? `반응 ${allCount}개` : `${dominantPercent}%`;

  const commentSummary = product.commentSummary;

  return (
    // id = 가격 아래 근거 블록(커뮤니티 근거)의 「근거 보기」가 내려오는 곳
    <section id="community-reaction">
      <DetailSectionHeader
        className="mb-3"
        title="커뮤니티 반응"
        subtitle="실제 커뮤니티 반응을 AI로 요약한 내용이에요"
        right={
          <Tooltip
            align="right"
            polygonOffset={8}
            content={
              <p className="text-fixed-white text-13">
                <strong className="font-semibold">실제 커뮤니티</strong> 사용자들의
                <br />
                핫딜 반응을 요약해 확인해요
              </p>
            }
          >
            <button aria-label="커뮤니티 반응" title="커뮤니티 반응" className="-m-2 flex p-2">
              <Info />
            </button>
          </Tooltip>
        }
      />

      {/* 판정·키워드·AI 요약을 파란 카드 하나에 — 예전엔 파란 상자 안 흰 상자 + 바깥 회색 상자로 세 겹이었다.
          바탕은 파랑으로 둔다: 흰 카드로 바꿨더니 아래 제보 카드와 똑같아져 섹션이 묻혔다(10/15). */}
      <div className="space-y-3">
        <div className="bg-secondary-50 space-y-3 rounded-xl p-4">
          {allCount > 0 ? (
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <Thumbsup className="size-4.5" active />
              ) : (
                <Thumbsdown className="size-4.5" active />
              )}
              <span className="text-base font-semibold text-gray-800">
                {isPositive ? '추천해요' : '아쉬워요'}
              </span>
              <span className={cn(text.muted, 'tabular-nums')}>· {share}</span>
            </div>
          ) : (
            <p className={emptyText}>아직 모은 반응이 없어요</p>
          )}

          {/* 긍정 먼저, 부정 뒤 — 칩 테두리·숫자 색이 긍·부정을 말한다(줄 앞 「긍정」 라벨은 칩 머리말과 겹쳤다). */}
          {(positiveItems.length > 0 || negativeItems.length > 0) && (
            <ul className="flex flex-wrap gap-1.5">
              {[...positiveItems, ...negativeItems].map((item) => (
                <KeywordChip key={`${item.type}-${item.name}`} item={item} />
              ))}
            </ul>
          )}

          {statusSummary && <p className={text.caption}>{statusSummary.message}</p>}

          {commentSummary && <Reactions commentSummary={commentSummary} />}

          <div className="border-secondary-100 flex items-center justify-between gap-2 border-t pt-3">
            <span className={text.caption}>{lastUpdatedAt ?? '\u00a0'}</span>
            {product.url && !MALL_SOURCED_PROVIDER_IDS.has(product.provider.id) ? (
              <CommunityLink url={product.url} provider={product.provider.nameKr} />
            ) : null}
          </div>
        </div>

        <Suspense>
          <ProductReport productId={productId} />
        </Suspense>
      </div>
    </section>
  );
}
