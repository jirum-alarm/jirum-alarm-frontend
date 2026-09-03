import Link from 'next/link';

import type { ProductModelPageLink } from '@/shared/api/product/product.service';
import { cn } from '@/shared/lib/cn';

type Props = {
  /** `formatPriceHistorySeoText` 결과. meta·JSON-LD 와 **같은 문구**를 쓴다. */
  priceRangeText?: string | null;
  /** `formatDealAgeNotice` 결과. JSON-LD 가 재고를 주장하지 않는 것과 짝이다. */
  ageNotice?: string | null;
  modelPage?: ProductModelPageLink | null;
  className?: string;
};

/**
 * 상세 가격 아래 SSR 블록 — 가격대 한 줄 + 모델 페이지 링크.
 *
 * 클라이언트 컴포넌트가 아니다(=첫 HTML 에 박힌다). 이게 요점:
 * - 가격 이력은 meta description·JSON-LD `additionalProperty` 에만 있고 **본문엔 없었다**.
 *   가격 추이 섹션은 `!mounted → null` 게이트라 서버 HTML 에 안 나온다. 그래서 구글이 요구하는
 *   "구조화 데이터 = 보이는 텍스트" 정합이 깨져 있었고, AI 가 인용할 문장도 없었다.
 * - `/deals/{slug}` 링크도 같은 이유로 서버 HTML 에 없었다 → 77만 상품 페이지에서 모델 페이지로
 *   가는 크롤 가능한 내부 링크가 0. bingbot 은 상품을 하루 7.7만 번 긁으면서 /deals 는 거의 안
 *   왔다(2026-09-03 실측 75분 표본: 상품 3,598 vs deals 10).
 *
 * 가격 추이 섹션에 있던 CTA 를 여기로 올렸다(링크 중복 방지 + 첫 화면 노출).
 */
export default function ProductPriceContext({
  priceRangeText,
  ageNotice,
  modelPage,
  className,
}: Props) {
  if (!priceRangeText && !ageNotice && !modelPage) return null;

  return (
    <section className={cn('flex flex-col gap-2', className)}>
      {priceRangeText ? <p className="text-sm text-gray-600">{priceRangeText}</p> : null}

      {ageNotice ? <p className="text-sm text-gray-500">{ageNotice}</p> : null}

      {modelPage ? (
        <Link
          href={`/deals/${modelPage.slug}`}
          data-track="model-page-cta"
          data-source="detail_price_context"
          data-slug={modelPage.slug}
          className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3.5 transition-colors hover:border-gray-300 hover:bg-gray-50"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {modelPage.modelName} 핫딜 최저가 모음
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {[
                modelPage.brand?.trim() || null,
                modelPage.dealCount > 0 ? `최근 핫딜 ${modelPage.dealCount}건` : null,
                '단위가로 비교',
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <span className="shrink-0 text-sm text-gray-400" aria-hidden>
            →
          </span>
        </Link>
      ) : null}
    </section>
  );
}
